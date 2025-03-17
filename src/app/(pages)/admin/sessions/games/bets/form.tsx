import ButtonLoader from '@/components/custom/ButtonLoader'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { gql, useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronsUpDown, X } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const FETCH_USERS = gql`
    query FetchUsers {
        fetchUsers {
            _id
            name
        }
    }
`

const FETCH_GAMES = gql`
    query FetchGames {
        fetchGames {
            _id
            start
            end
            winner
            status
            active
            A1 {
                _id
                name
            }
            A2 {
                _id
                name
            }
            B1 {
                _id
                name
            }
            B2 {
                _id
                name
            }
        }
    }
`

const FETCH_BET = gql`
  query FetchBet($id: ID!) {
    fetchBet(_id: $id) {
      _id
      betType
      betAmount
      paid
      active
      bettors {
        bettorForA {
          _id
          name
          contact
          password
          username
          role
          active
          createdAt
          updatedAt
        }
        bettorForB {
          _id
          name
          contact
          password
          username
          role
          active
          createdAt
          updatedAt
        }
      }
      game {
        _id
        start
        end
        winner
        status
        active
        A1 {
          _id
          name
          contact
          password
          username
          role
          active
          createdAt
          updatedAt
        }
        A2 {
          _id
          name
          contact
          password
          username
          role
          active
          createdAt
          updatedAt
        }
        B1 {
          _id
          name
          contact
          password
          username
          role
          active
          createdAt
          updatedAt
        }
        B2 {
          _id
          name
          contact
          password
          username
          role
          active
          createdAt
          updatedAt
        }
        court {
          _id
          name
          price
          active
          createdAt
          updatedAt
        }
        shuttlesUsed {
          quantity
          shuttle {
            _id
            name
            price
            active
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`

const CREATE_BET = gql`
  mutation CreateBet(
    $bettors: [BettorPairInput]
    $game: ID!
    $betType: String!
    $betAmount: Float!
  ) {
    createBet(
      input: {
        bettors: $bettors
        game: $game
        betType: $betType
        betAmount: $betAmount
      }
    ) {
      _id
      betType
      betAmount
      paid
      active
      bettors {
        bettorForA {
          _id
          name
        }
        bettorForB {
          _id
          name
        }
      }
      game {
        _id
        start
        end
        winner
        status
        active
      }
    }
  }
`;

const UPDATE_BET = gql`
  mutation UpdateBet(
    $id: ID!
    $bettors: [BettorPairInput]
    $game: ID
    $betType: String
    $betAmount: Float
    $paid: Boolean
  ) {
    updateBet(
      input: {
        _id: $id
        bettors: $bettors
        game: $game
        betType: $betType
        betAmount: $betAmount
        paid: $paid
      }
    ) {
      _id
      betType
      betAmount
      paid
      active
      bettors {
        bettorForA {
          _id
          name
        }
        bettorForB {
          _id
          name
        }
      }
      game {
        _id
        start
        end
        winner
        status
        active
      }
    }
  }
`

export const CreateUser = gql`
    mutation CreateUser($name: String!) {
        createUser(input: { name: $name }) {
            _id
            name
        }
    }
`

export const UserSchema = z.object({
    _id: z.string().nonempty('User is required.'),
    name: z.string().nonempty('Name is required.'),
})

export const GameSchema = z.object({
    _id: z.string().nonempty('Game is required.'),
    start: z.string().nonempty('Start is required.'),
    end: z.string().nonempty('End is required.'),
    winner: z.string().nonempty('Winner is required.'),
    status: z.string().nonempty('Status is required.'),
    active: z.string().nonempty('Active is required.'),
    A1: z.string().nonempty('A1 is required.'),
    A2: z.string().nonempty('A2 is required.'),
    B1: z.string().nonempty('B1 is required.'),
    B2: z.string().nonempty('B2 is required.'),
})

export const BetSchema = z.object({
    bettors: z.array(
      z.object({
        bettorForA: z.string().nullable(), 
        bettorForB: z.string().nullable(), 
      })
    ),
    game: z.string().nonempty('Game is required.'),
    betType: z.string().nonempty('BetType is required.'),
    betAmount: z.number().nonnegative('BetAmount must be a positive number.'),
    paid: z
      .boolean()
      .refine((val) => typeof val === 'boolean', 'Paid must be a boolean.'),
  })

const BetsForm = ({
    gameId,
    id,
    refetch,
    disabled,
}: {
    gameId: string
    id?: string
    refetch?: () => void
    disabled?: boolean
}) => {
    const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});
    const [open, setOpen] = useState<boolean>(false)
    const [isPending, startTransition] = useTransition()
    const { data: userData } = useQuery(FETCH_USERS)
    const { data: gameData } = useQuery(FETCH_GAMES)
    const [createUser] = useMutation(CreateUser)
    const { data } = useQuery(FETCH_BET, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'network-only',
    })
    const [submit] = useMutation(id ? UPDATE_BET : CREATE_BET)
    const [bettorRows, setBettorRows] = useState<
  { 
    bettorForA: string | null, 
    bettorForB: string | null, 
    displayA: string, 
    displayB: string 
  }[]
>([
  { bettorForA: null, bettorForB: null, displayA: '', displayB: '' },
])
    const [searchTermA, setSearchTermA] = useState<Record<string, string>>({})
    const [searchTermB, setSearchTermB] = useState<Record<string, string>>({})

    const form = useForm<z.infer<typeof BetSchema>>({
        resolver: zodResolver(BetSchema),
        defaultValues: {
          bettors: [{ bettorForA: null, bettorForB: null }], 
          game: gameId,
          betType: '',
          betAmount: 0.0,
          paid: false,
        },
      });

      const addBettorRow = () => {
        if (disabled) return;
        
        const newBettorRow = {
          bettorForA: null,
          bettorForB: null,
          displayA: '',
          displayB: '',
        };
        setBettorRows([...bettorRows, newBettorRow]);
        form.setValue('bettors', [...form.getValues().bettors, { bettorForA: null, bettorForB: null }]);
      }

    const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>(
        {}
    )

    const removeBettorRow = (index: number) => {
        if (disabled) return;
        
        const updatedBettorRows = [...bettorRows];
        if (index === 0) {
          updatedBettorRows[index] = {
            bettorForA: null,
            bettorForB: null,
            displayA: '',
            displayB: '',
          };
        } else {
          updatedBettorRows.splice(index, 1);
        }
        
        setBettorRows(updatedBettorRows);
        form.setValue('bettors', updatedBettorRows.map(({ bettorForA, bettorForB }) => ({
          bettorForA,
          bettorForB
        })));
      };

    const handleSearchChangeA = (index: number, value: string) => {
        setSearchTermA(prev => ({ ...prev, [index]: value }));
        if (!value) handleBettorChange(index, 'bettorForA', null);
      }
      
      const handleSearchChangeB = (index: number, value: string) => {
        setSearchTermB(prev => ({ ...prev, [index]: value }));
        if (!value) handleBettorChange(index, 'bettorForB', null);
      }

    const filteredUsersA = (index: number) => {
        return userData?.fetchUsers.filter((user: any) =>
            user.name
                .toLowerCase()
                .includes(searchTermA[index]?.toLowerCase() || '')
        )
    }

    const filteredUsersB = (index: number) => {
        return userData?.fetchUsers.filter((user: any) =>
            user.name
                .toLowerCase()
                .includes(searchTermB[index]?.toLowerCase() || '')
        )
    }

    const handleBettorChange = async (
        index: number,
        field: 'bettorForA' | 'bettorForB',
        value: string | null
    ) => {
        if (disabled) return

        const updatedBettorRows = [...bettorRows];
        updatedBettorRows[index][field] = value;

        const user = value ? userData?.fetchUsers.find((user: any) => user._id === value) : null;

        if (field === 'bettorForA') {
          updatedBettorRows[index].displayA = user?.name || value || '';
        } else if (field === 'bettorForB') {
          updatedBettorRows[index].displayB = user?.name || value || '';
        }
        setBettorRows(updatedBettorRows);
        form.setValue('bettors', updatedBettorRows);
    }

    const handlePopoverToggle = (key: string, isOpen: boolean) => {
        setOpenPopovers((prev) => ({
            ...prev,
            [key]: isOpen,
        }))
    }

    useEffect(() => {
        if (data?.fetchBet) {
            const selectedGame = gameData?.fetchGames?.find(
                (game: any) => game._id === data.fetchBet?.game?._id 
            )

            const initialBettors = data.fetchBet.bettors.map((bettor: any) => ({
                bettorForA: bettor.bettorForA?._id || null,
                bettorForB: bettor.bettorForB?._id || null,
                displayA: bettor.bettorForA?.name || '',
                displayB: bettor.bettorForB?.name || '',
            }));
          
              setBettorRows(initialBettors);
              form.reset({
                bettors: initialBettors.map(({ bettorForA, bettorForB }: { bettorForA: string | null, bettorForB: string | null }) => ({
                  bettorForA,
                  bettorForB
                })),
                game: selectedGame?._id || gameId,
                betType: data.fetchBet?.betType || '',
                betAmount: data.fetchBet?.betAmount || 0.0,
                paid: data.fetchBet?.paid || false,
            })
        }
    }, [data?.fetchBet, gameData, form, gameId])

    const closeForm = () => {
        setOpen(false);
        form.reset();
        if (refetch) refetch();
      }      
    
      const onSubmit = async (values: z.infer<typeof BetSchema>) => {
        if (disabled) return;
        startTransition(async () => {
          try {
            const submittedValues = { ...values };
      
            // Process each bettor pair to resolve user IDs
            for (const pair of submittedValues.bettors) {
              // Process bettorForA
              if (pair.bettorForA) {
                let bettorAId = pair.bettorForA;
                const existingUserById = userData.fetchUsers.find((user: any) => user._id === bettorAId);
      
                if (!existingUserById) {
                  const existingUserByName = userData.fetchUsers.find((user: any) => user.name === bettorAId);
                  if (existingUserByName) {
                    bettorAId = existingUserByName._id;
                  } else {
                    const { data: createUserData } = await createUser({
                      variables: { name: bettorAId },
                      refetchQueries: [{ query: FETCH_USERS }],
                    });
                    bettorAId = createUserData.createUser._id;
                  }
                }
                pair.bettorForA = bettorAId;
              }
      
              // Process bettorForB
              if (pair.bettorForB) {
                let bettorBId = pair.bettorForB;
                const existingUserById = userData.fetchUsers.find((user: any) => user._id === bettorBId);
      
                if (!existingUserById) {
                  const existingUserByName = userData.fetchUsers.find((user: any) => user.name === bettorBId);
                  if (existingUserByName) {
                    bettorBId = existingUserByName._id;
                  } else {
                    const { data: createUserData } = await createUser({
                      variables: { name: bettorBId },
                      refetchQueries: [{ query: FETCH_USERS }],
                    });
                    bettorBId = createUserData.createUser._id;
                  }
                }
                pair.bettorForB = bettorBId;
              }
            }
      
            // Prepare formatted values for submission
            const bettors = submittedValues.bettors.map((pair) => ({
              bettorForA: pair.bettorForA || null,
              bettorForB: pair.bettorForB || null,
            }));
      
            const formattedValues = {
              bettors,
              game: submittedValues.game,
              betType: submittedValues.betType,
              betAmount: Number(submittedValues.betAmount),
              paid: Boolean(submittedValues.paid),
              id: id || undefined,
            };
      
            // Submit the bet
            await submit({
              variables: formattedValues,
            })

            closeForm();
          } catch (error) {
            console.error(error);
          }
        });
      }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="w-full" disabled={disabled}>
                    {id ? 'Update Bet' : 'Create Bet'}
                </Button>
            </SheetTrigger>
            <SheetContent
                side="bottom"
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="w-screen max-h-screen flex flex-col"
                style={{
                    top: 'auto',
                    maxHeight: '90vh',
                    overflow: 'auto',
                  }}
            >
                <SheetHeader>
                    <SheetTitle>{id ? 'Update Bet' : 'Create Bet'}</SheetTitle>
                    <SheetDescription className='text-base'>
                        Please fill up the necessary information below.
                    </SheetDescription>
                    <Form {...form}>
                        <form
                            className="flex-1 overflow-auto px-1 -mx-1 flex flex-col gap-1"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            {bettorRows.map((bettor, index) => (
                                <div key={index} className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`bettors.${index}.bettorForA`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className="font-bold">
                                                    Bettor For Team A
                                                </FormLabel>
                                                <FormControl>
                                                    <Popover
                                                        modal
                                                        open={
                                                            openPopovers[
                                                                `bettorA-${index}`
                                                            ] || false
                                                        }
                                                        onOpenChange={(
                                                            isOpen
                                                        ) =>
                                                            handlePopoverToggle(
                                                                `bettorA-${index}`,
                                                                isOpen
                                                            )
                                                        }
                                                    >
                                                      <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={openPopovers[`bettorA-${index}`]}
                                                                className="w-full justify-between"
                                                            >
                                                                {/* {bettor.displayA || (
                                                                <span className="text-muted-foreground">Select Bettor A</span>
                                                                )} */}
                                                                {bettor.displayA || <span className="text-muted-foreground"> Select Bettor A </span>}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                                {/* {bettor.bettorForA ? (
                                                                    userData?.fetchUsers.find(
                                                                        (
                                                                            user: any
                                                                        ) =>
                                                                            user._id ===
                                                                            bettor.bettorForA
                                                                    )?.name
                                                                ) : (
                                                                    <span className="text-muted-foreground">
                                                                        Select
                                                                        Bettor A
                                                                    </span>
                                                                )} */}
                                                                
                                                        </PopoverTrigger>
                                                        <PopoverContent className="p-0 w-fit">
                                                            <Command
                                                                filter={(
                                                                    value,
                                                                    search
                                                                ) => {
                                                                    const user =
                                                                        userData?.fetchUsers.find(
                                                                            (
                                                                                user: any
                                                                            ) =>
                                                                                user.name
                                                                                    .toLowerCase()
                                                                                    .includes(
                                                                                        search.toLowerCase()
                                                                                    )
                                                                        )
                                                                    return user
                                                                        ? 1
                                                                        : 0
                                                                }}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    const input = inputRefs.current[`input-${index}`];
                                                                    if (input) {
                                                                      setTimeout(() => {
                                                                        input.scrollIntoView({ 
                                                                          behavior: 'smooth', 
                                                                          block: 'center',
                                                                          inline: 'nearest'
                                                                        });
                                                                      }, 100);
                                                                    }
                                                                  }}
                                                            >
                                                                 <CommandInput
                                                                    ref={(el) => {
                                                                    if (el) inputRefs.current[`input-${index}`] = el;
                                                                    }}
                                                                    placeholder="Search Bettor A..."
                                                                    value={searchTermA[index] || ''}
                                                                    onValueChange={(value) => {
                                                                    handleSearchChangeA(index, value);
                                                                    if (!userData?.fetchUsers.find((user: any) => 
                                                                        user.name.toLowerCase() === value.toLowerCase()
                                                                    )) {
                                                                        handleBettorChange(index, 'bettorForA', value);
                                                                    }
                                                                    }}
                                                                    onEnterKey={() => {
                                                                    const currentValue = searchTermA[index] || '';
                                                                    if (currentValue) {
                                                                        handleBettorChange(index, 'bettorForA', currentValue);
                                                                        handlePopoverToggle(`bettorA-${index}`, false);
                                                                        // Focus next input
                                                                        setTimeout(() => {
                                                                        const nextInput = document.querySelector<HTMLInputElement>(
                                                                            `input[name="bettors.${index}.bettorForA"]`
                                                                        );
                                                                        nextInput?.focus();
                                                                        }, 100);
                                                                    }
                                                                    }}
                                                                />
                                                                <CommandList>
                                                                    <CommandGroup>
                                                                        {/* {userData?.fetchUsers.map((user: any) => ( */}
                                                                        {filteredUsersA(
                                                                            index
                                                                        )?.map(
                                                                            (
                                                                                user: any
                                                                            ) => (
                                                                                <CommandItem
                                                                                    key={
                                                                                        user._id
                                                                                    }
                                                                                    value={
                                                                                        user.name
                                                                                    }
                                                                                    onSelect={() => {
                                                                                        handleBettorChange(
                                                                                            index,
                                                                                            'bettorForA',
                                                                                            user._id
                                                                                        )
                                                                                        field.onChange(
                                                                                            user._id
                                                                                        )
                                                                                        handlePopoverToggle(
                                                                                            `bettorA-${index}`,
                                                                                            false
                                                                                        )
                                                                                        setTimeout(() => {
                                                                                            const nextInput = document.querySelector<HTMLInputElement>(
                                                                                              `input[name="bettors.${index}.bettorForA"]`
                                                                                            );
                                                                                            nextInput?.scrollIntoView({ 
                                                                                              behavior: 'smooth', 
                                                                                              block: 'center',
                                                                                              inline: 'nearest'
                                                                                            });
                                                                                          }, 100)
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        user.name
                                                                                    }
                                                                                </CommandItem>
                                                                            )
                                                                        )}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`bettors.${index}.bettorForB`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className="font-bold">
                                                    Bettor For Team B
                                                </FormLabel>
                                                <FormControl>
                                                    <Popover
                                                        modal
                                                        open={
                                                            openPopovers[
                                                                `bettorB-${index}`
                                                            ] || false
                                                        }
                                                        onOpenChange={(
                                                            isOpen
                                                        ) =>
                                                            handlePopoverToggle(
                                                                `bettorB-${index}`,
                                                                isOpen
                                                            )
                                                        }
                                                    >
                                                       <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={openPopovers[`bettorB-${index}`]}
                                                                className="w-full justify-between"
                                                            >
                                                                {/* {bettor.displayB || (
                                                                <span className="text-muted-foreground">Select Bettor B</span>
                                                                )} */}
                                                                {bettor.displayB || <span className="text-muted-foreground"> Select Bettor B </span>}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                                {/* {bettor.bettorForB ? (
                                                                    userData?.fetchUsers.find(
                                                                        (
                                                                            user: any
                                                                        ) =>
                                                                            user._id ===
                                                                            bettor.bettorForB
                                                                    )?.name
                                                                ) : (
                                                                    <span className="text-muted-foreground">
                                                                        Select
                                                                        Bettor B
                                                                    </span>
                                                                )} */}
                                                        </PopoverTrigger>
                                                        <PopoverContent className="p-0 w-fit">
                                                        <Command
                                                                filter={(
                                                                    value,
                                                                    search
                                                                ) => {
                                                                    const user =
                                                                        userData?.fetchUsers.find(
                                                                            (
                                                                                user: any
                                                                            ) =>
                                                                                user.name
                                                                                    .toLowerCase()
                                                                                    .includes(
                                                                                        search.toLowerCase()
                                                                                    )
                                                                        )
                                                                    return user
                                                                        ? 1
                                                                        : 0
                                                                }}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    const input = inputRefs.current[`input-${index}`];
                                                                    if (input) {
                                                                      setTimeout(() => {
                                                                        input.scrollIntoView({ 
                                                                          behavior: 'smooth', 
                                                                          block: 'center',
                                                                          inline: 'nearest'
                                                                        });
                                                                      }, 100);
                                                                    }
                                                                  }}
                                                            >
                                                                <CommandInput
                                                                    ref={(el) => {
                                                                    if (el) inputRefs.current[`input-${index}`] = el;
                                                                    }}
                                                                    placeholder="Search Bettor B..."
                                                                    value={searchTermB[index] || ''}
                                                                    onValueChange={(value) => {
                                                                    handleSearchChangeB(index, value);
                                                                    if (!userData?.fetchUsers.find((user: any) => 
                                                                        user.name.toLowerCase() === value.toLowerCase()
                                                                    )) {
                                                                        handleBettorChange(index, 'bettorForB', value);
                                                                    }
                                                                    }}
                                                                    onEnterKey={() => {
                                                                    const currentValue = searchTermB[index] || '';
                                                                    if (currentValue) {
                                                                        handleBettorChange(index, 'bettorForB', currentValue);
                                                                        handlePopoverToggle(`bettorB-${index}`, false);
                                                                        // Focus next input
                                                                        setTimeout(() => {
                                                                        const nextInput = document.querySelector<HTMLInputElement>(
                                                                            `input[name="bettors.${index}.bettorForB"]`
                                                                        );
                                                                        nextInput?.focus();
                                                                        }, 100);
                                                                    }
                                                                    }}
                                                                />
                                                                <CommandList>
                                                                    <CommandGroup>
                                                                        {/* {userData?.fetchUsers.map((user: any) => ( */}
                                                                        {filteredUsersB(
                                                                            index
                                                                        )?.map(
                                                                            (
                                                                                user: any
                                                                            ) => (
                                                                                <CommandItem
                                                                                    key={
                                                                                        user._id
                                                                                    }
                                                                                    value={
                                                                                        user.name
                                                                                    }
                                                                                    onSelect={() => {
                                                                                        handleBettorChange(
                                                                                            index,
                                                                                            'bettorForB',
                                                                                            user._id
                                                                                        )
                                                                                        field.onChange(
                                                                                            user._id
                                                                                        )
                                                                                        handlePopoverToggle(
                                                                                            `bettorB-${index}`,
                                                                                            false
                                                                                        )
                                                                                        setTimeout(() => {
                                                                                            const nextInput = document.querySelector<HTMLInputElement>(
                                                                                              `input[name="bettors.${index}.bettorForB"]`
                                                                                            );
                                                                                            nextInput?.scrollIntoView({ 
                                                                                              behavior: 'smooth', 
                                                                                              block: 'center',
                                                                                              inline: 'nearest'
                                                                                            });
                                                                                          }, 100);
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        user.name
                                                                                    }
                                                                                </CommandItem>
                                                                            )
                                                                        )}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    {(bettorRows.length > 1 || Object.values(bettorRows[index]).some(value => value !== null && value.trim() !== '')) && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeBettorRow(index)}
                                            disabled={disabled || isPending}
                                            className='mt-8 shrink-0' 
                                        >
                                            <X className='flex items-center justify-center w-full'/>
                                        </Button>   
                                    )}
                                </div>

                            ))}
                            <Button
                                type="button"
                                onClick={addBettorRow}
                                className="mt-4"
                                disabled={disabled || isPending}
                            >
                                Add Bettor Pair
                            </Button>
                            {/* <FormField
                                control={form.control}
                                name="game"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Game</FormLabel>
                                        <select
                                            {...field}
                                            className="text-sm w-full border border-gray-300 rounded p-2"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                        >
                                            <option value="">Game</option>
                                            {gameData?.fetchGames && gameData.fetchGames.length > 0 ? (
                                            gameData.fetchGames
                                                .filter((game: any) => new Date(game.start) > new Date()) 
                                                .map((game: any) => {
                                                    const gameLabel = `${game.A1.name} & ${game.A2.name} vs ${game.B1.name} & ${game.B2.name}`
                                                    return (
                                                        <option key={game._id} value={game._id}>
                                                            {gameLabel}
                                                        </option>
                                                    )
                                                })
                                        ) : (
                                            <option disabled>No Game Available Today</option>
                                        )}
                                        </select>
                                    </FormItem>
                                )}
                            /> */}

                            <FormField
                                control={form.control}
                                name="betType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">
                                            Bet Type
                                        </FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                className="text-sm w-full border border-gray-300 rounded p-2"
                                                placeholder="Bet Type"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="betAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">
                                            Bet Amount
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                className="text-sm"
                                                placeholder="Bet Amount"
                                                step={0.01}
                                                type="number"
                                                onBlur={(e) => {
                                                    const value = parseFloat(
                                                        e.target.value
                                                    )
                                                    field.onChange(
                                                        isNaN(value) ? 0 : value
                                                    )
                                                }}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value === ''
                                                            ? ''
                                                            : parseFloat(
                                                                  e.target.value
                                                              )
                                                    field.onChange(value)
                                                }}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {id && (
                                <FormField
                                    control={form.control}
                                    name="paid"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Paid</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    value={String(field.value)}
                                                    className="text-sm w-full border border-gray-300 rounded p-2"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value ===
                                                                'true'
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select Paid
                                                    </option>
                                                    <option value="true">
                                                        True
                                                    </option>
                                                    <option value="false">
                                                        False
                                                    </option>
                                                </select>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}
                            <Button
                                type="submit"
                                className="mt-6 w-full"
                                disabled={isPending}
                            >
                                {isPending ? <ButtonLoader /> : 'Save Bet'}
                            </Button>
                        </form>
                    </Form>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button onClick={() => closeForm()} variant="ghost">
                                Close
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}

export default BetsForm
