import ButtonLoader from '@/components/custom/ButtonLoader'
import MultipleSelector from '@/components/custom/MutliSelector'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
import { visit } from 'graphql'
import { Loader2 } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
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
        $bettorForA: [ID!]!
        $bettorForB: [ID!]!
        $visitorBettorForA: [String]
        $visitorBettorForB: [String]
        $game: ID!
        $betType: String!
        $betAmount: Float!
    ) {
        createBet(
            input: {
                bettorForB: $bettorForB
                bettorForA: $bettorForA
                visitorBettorForA: $visitorBettorForA
                visitorBettorForB: $visitorBettorForB
                game: $game
                betType: $betType
                betAmount: $betAmount
            }
        ) {
            _id
            visitorBettorForA
            visitorBettorForB
            betType
            betAmount
            paid
            active
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

const UPDATE_BET = gql`
    mutation UpdateBet(
        $id: ID!
        $bettorForA: [ID]
        $bettorForB: [ID]
        $visitorBettorForA: [String]
        $visitorBettorForB: [String]
        $game: ID
        $betType: String
        $betAmount: Float
        $paid: Boolean
    ) {
        updateBet(
            input: {
                _id: $id
                bettorForA: $bettorForA
                bettorForB: $bettorForB
                visitorBettorForA: $visitorBettorForA
                visitorBettorForB: $visitorBettorForB
                game: $game
                betType: $betType
                betAmount: $betAmount
                paid: $paid
            }
        ) {
            _id
            visitorBettorForA
            visitorBettorForB
            betType
            betAmount
            paid
            active
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
    bettorForA: z.array(z.string()).nonempty('BettorForA is required.'),
    bettorForB: z.array(z.string()).nonempty('BettorForB is required.'),
    visitorBettorForA: z.array(z.string()).nonempty('VisitorBettorForA is required.'),
    visitorBettorForB: z.array(z.string()).nonempty('VisitorBettorForB is required.'),
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
}: {
    gameId: string
    id?: string
    refetch?: () => void
}) => {
    const [open, setOpen] = useState<boolean>(false)
    const [isPending, startTransition] = useTransition()
    const { data: userData, loading: userLoading } = useQuery(FETCH_USERS)
    const { data: gameData, loading: gameLoading } = useQuery(FETCH_GAMES)
    const { data, loading } = useQuery(FETCH_BET, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'network-only',
    })
    const [submit] = useMutation(id ? UPDATE_BET : CREATE_BET)
    const form = useForm<z.infer<typeof BetSchema>>({
        resolver: zodResolver(BetSchema),
        defaultValues: {
            bettorForA: [],
            bettorForB: [],
            visitorBettorForA: [],
            visitorBettorForB: [],
            game: gameId,
            betType: '',
            betAmount: 0.0,
            paid: false,
        },
    })
    const [visitorBettorForAInputs, setVisitorBettorForAInputs] = useState<string[]>([])
    const [visitorBettorForBInputs, setVisitorBettorForBInputs] = useState<string[]>([])
    
    const addVisitorBettorForA = () => {
        setVisitorBettorForAInputs([...visitorBettorForAInputs, ''])
    }
    const addVisitorBettorForB = () => {
        setVisitorBettorForBInputs([...visitorBettorForBInputs, ''])
    }
    
    const handleVisitorBettorForAChange = (index: number, value: string) => {
        // const updated = [...visitorBettorForAInputs]
        // updated[index] = value
        // setVisitorBettorForAInputs(updated)
        const newInputs = [...visitorBettorForAInputs]
        newInputs[index] = value
        setVisitorBettorForAInputs(newInputs)
        form.setValue('visitorBettorForA', newInputs.filter(input => input.trim() !== '') as [string, ...string[]])
    }

    const handleVisitorBettorForBChange = (index: number, value: string) => {
        // const updated = [...visitorBettorForBInputs]
        // updated[index] = value
        // setVisitorBettorForBInputs(updated)
        const newInputs = [...visitorBettorForBInputs]
        newInputs[index] = value
        setVisitorBettorForBInputs(newInputs)
        form.setValue('visitorBettorForB', newInputs.filter(input => input.trim() !== '') as [string, ...string[]])
    }
    
    useEffect(() => {
        if (data?.fetchBet) {
            const selectedGame = gameData?.fetchGames?.find(
                (game: any) => game._id === data.fetchBet?.game?._id
            )

            form.reset({
                bettorForA:
                    data.fetchBet?.bettorForA?.map(
                        (bettor: any) => bettor._id
                    ) || [],
                bettorForB:
                    data.fetchBet?.bettorForB?.map(
                        (bettor: any) => bettor._id
                    ) || [],
                game: selectedGame?._id || gameId,
                betType: data.fetchBet?.betType || '',
                betAmount: data.fetchBet?.betAmount || 0.0,
                paid: data.fetchBet?.paid || false,
            })
        }
    }, [data?.fetchBet, gameData, form])

    const onSubmit = (values: z.infer<typeof BetSchema>) => {
        startTransition(async () => {
            try {
                const formattedValues = {
                    ...values,
                    // visitorBettorForA: visitorBettorForAInputs,
                    // visitorBettorForB: visitorBettorForBInputs,
                    betAmount: Number(values.betAmount),
                    paid: Boolean(values.paid),
                    id: id || undefined,
                }
                const response = await submit({
                    variables: formattedValues,
                })
                if (response) closeForm()
            } catch (error) {
                console.error(error)
            }
        })
    }

    const closeForm = () => {
        setOpen(false)
        form.reset()
        if (refetch) refetch()
    }

    const userOptions =
        userData?.fetchUsers.map((user: any) => ({
            value: user._id,
            label: user.name,
        })) || []

    if (loading) return <Loader2 />

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="w-full">
                    {id ? 'Update Bet' : 'Create Bet'}
                </Button>
            </SheetTrigger>
            <SheetContent
                side="bottom"
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="w-screen max-h-screen flex flex-col"
            >
                <SheetHeader>
                    <SheetTitle>{id ? 'Update Bet' : 'Create Bet'}</SheetTitle>
                    <SheetDescription>
                        Please fill up the necessary information below.
                    </SheetDescription>
                    <Form {...form}>
                        <form
                            className="flex-1 overflow-auto px-1 -mx-1 flex flex-col gap-1"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <Button type="button" onClick={addVisitorBettorForA}>
                                Add Visitor Bettor For Team A
                            </Button>
                            {visitorBettorForAInputs.map((input, index) => (
                                <FormField
                                control={form.control}
                                name="bettorForA"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FormItem>
                                                <FormLabel className="font-bold">
                                                    Bettor For Team A
                                                </FormLabel>
                                                <FormControl>
                                                    <MultipleSelector
                                                        value={field.value.map(
                                                            (id: string) => ({
                                                                value: id,
                                                                label:
                                                                    userData?.fetchUsers.find(
                                                                        (
                                                                            user: any
                                                                        ) =>
                                                                            user._id ===
                                                                            id
                                                                    )?.name ||
                                                                    id,
                                                            })
                                                        )}
                                                        onChange={(options) => {
                                                            field.onChange(
                                                                options.map(
                                                                    (option) =>
                                                                        option.value
                                                                )
                                                            )
                                                        }}
                                                        defaultOptions={
                                                            userOptions
                                                        }
                                                        placeholder="Select or type to add bettors for Team A"
                                                        creatable 
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        </FormControl>
                                    </FormItem>
                                )}
                                />
                            ))}
                          
                            {/* <Button onClick={addVisitorBettorForA} type='button'>Add Visitor Bettor A</Button>
                            {visitorBettorForAInputs.map((inputValue, index) => (
                                <Input
                                    key={index}
                                    value={inputValue}
                                    onChange={(e) => handleVisitorBettorForAChange(index, e.target.value)}
                                    placeholder="Enter Visitor Bettor for A"
                                    className="mt-2"
                                />
                            ))} */}
                        <Button type="button" onClick={addVisitorBettorForB} >
                                Add Visitor Bettor For Team B
                            </Button>
                        {visitorBettorForBInputs.map((input, index ) => (
                            <FormField
                            control={form.control}
                            name="bettorForB"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">
                                        Bettor For Team B
                                    </FormLabel>
                                    <FormControl>
                                        <MultipleSelector
                                            value={field.value.map(
                                                (id: string) => ({
                                                    value: id,
                                                    label:
                                                        userData?.fetchUsers.find(
                                                            (user: any) =>
                                                                user._id ===
                                                                id
                                                        )?.name || id,
                                                })
                                            )}
                                            onChange={(options) => {
                                                field.onChange(
                                                    options.map(
                                                        (option) =>
                                                            option.value
                                                    )
                                                )
                                            }}
                                            defaultOptions={userOptions}
                                            placeholder="Select bettors for Team B"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
/>
                        ))}
                          
                            {/* <Button onClick={addVisitorBettorForB} type='button'>Add Visitor Bettor B</Button>
                                {visitorBettorForBInputs.map((inputValue, index) => (
                                    <Input
                                        key={index}
                                        value={inputValue}
                                        onChange={(e) => handleVisitorBettorForBChange(index, e.target.value)}
                                        placeholder="Enter Visitor Bettor for B"
                                        className="mt-2"
                                    />
                                ))} */}
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
