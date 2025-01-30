import ButtonLoader from '@/components/custom/ButtonLoader'
import { Button } from '@/components/ui/button'
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
        $bettorForA: ID!
        $bettorForB: ID!
        $game: ID!
        $betType: String!
        $betAmount: Float!
    ) {
        createBet(
            input: {
                bettorForB: $bettorForB
                bettorForA: $bettorForA
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
        $bettorForA: ID
        $bettorForB: ID
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
    bettorForA: z.string().nonempty('BettorForA is required.'),
    bettorForB: z.string().nonempty('BettorForB is required.'),
    game: z.string().nonempty('Game is required.'),
    betType: z.string().nonempty('BetType is required.'),
    betAmount: z.number().nonnegative('BetAmount must be a positive number.'),
    paid: z
        .boolean()
        .refine((val) => typeof val === 'boolean', 'Paid must be a boolean.'),
})

const BetsForm = ({ gameId, id, refetch }: { gameId: string, id?: string; refetch?: () => void }) => {
    const [open, setOpen] = useState<boolean>(false)
    const [isPending, startTransition] = useTransition()
    const { data: userData, loading: userLoading } = useQuery(FETCH_USERS)
    const { data: gameData, loading: gameLoading } = useQuery(FETCH_GAMES)
    const { data, loading } = useQuery(FETCH_BET, {
        variables: { id: gameId },
        skip: !gameId,
        fetchPolicy: 'network-only',
    })
    const [submit] = useMutation(id ? UPDATE_BET : CREATE_BET)
    const form = useForm<z.infer<typeof BetSchema>>({
        resolver: zodResolver(BetSchema),
        defaultValues: {
            bettorForA: '',
            bettorForB: '',
            game: '',
            betType: '',
            betAmount: 0.0,
            paid: false,
        },
    })

    useEffect(() => {
        if (data?.fetchBet) {
            const selectedGame = gameData?.fetchGames?.find(
                (game: any) => game._id === data.fetchBet?.game?._id
            )

            form.reset({
                bettorForA: data.fetchBet?.bettorForA?._id || '',
                bettorForB: data.fetchBet?.bettorForB?._id || '',
                game: selectedGame?._id || '',
                betType: data.fetchBet?.betType || '',
                betAmount: data.fetchBet?.betAmount || 0.0,
                paid: data.fetchBet?.paid || false,
            })
        }
    }, [data, gameData, form])

    const onSubmit = (values: z.infer<typeof BetSchema>) => {
        startTransition(async () => {
            try {
                const formattedValues = {
                    ...values,
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
                            <FormField
                                control={form.control}
                                name="bettorForA"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bettor A</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="text-sm w-full border border-gray-300 rounded p-2"
                                            >
                                                <option value="">
                                                    {' '}
                                                    Select Bettor A{' '}
                                                </option>
                                                {userData?.fetchUsers.map(
                                                    (user: any) => (
                                                        <option
                                                            key={user._id}
                                                            value={user._id}
                                                        >
                                                            {user.name}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bettorForB"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bettor B</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="text-sm w-full border border-gray-300 rounded p-2"
                                            >
                                                <option value="">
                                                    Select Bettor B
                                                </option>
                                                {userData?.fetchUsers.map(
                                                    (user: any) => (
                                                        <option
                                                            key={user._id}
                                                            value={user._id}
                                                        >
                                                            {user.name}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
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
                            />

                            <FormField
                                control={form.control}
                                name="betType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bet Type</FormLabel>
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
                                    <FormLabel>Bet Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            className="text-sm"
                                            placeholder="Bet Amount"
                                            step={0.01}
                                            type="number"
                                            onBlur={(e) => {
                                                const value = parseFloat(e.target.value);
                                                field.onChange(isNaN(value) ? 0 : value); // Ensure it's always a number
                                            }}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                           { id && (
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
                                                  onChange={(e) => field.onChange(e.target.value === "true")}
                                              >
                                                  <option value="">Select Paid</option>
                                                  <option value="true">True</option>
                                                  <option value="false">False</option>
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
