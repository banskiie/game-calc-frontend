import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet'
import { gql, useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState, useTransition } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import ButtonLoader from '@/components/custom/ButtonLoader'
import {  Loader2, Minus, Plus, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import TimePicker from '@/components/custom/timepicker'


const FETCH_GAME = gql`
    query FetchGame($id: ID!) {
        fetchGame(_id: $id) {
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
`
const CREATE_GAME = gql`
    mutation CreateGame(
        $start: DateTime
        $session: ID!
        $end: DateTime
        $A1: ID!
        $A2: ID
        $B1: ID!
        $B2: ID
        $court: ID!
        $shuttlesUsed: [ShuttlesUsedInput]
        $winner: Winner
        $status: Status!
    ) {
        createGame(
            input: {
                start: $start
                session: $session
                end: $end
                A1: $A1
                A2: $A2
                B1: $B1
                B2: $B2
                court: $court
                shuttlesUsed: $shuttlesUsed
                winner: $winner
                status: $status
            }
        ) {
            _id
            start
            end
            winner
            status
            active
        }
    }
`

const UPDATE_GAME = gql`
    mutation UpdateGame(
        $id: ID!
        $start: DateTime
        $session: ID
        $end: DateTime
        $A1: ID
        $A2: ID
        $B1: ID
        $B2: ID
        $court: ID
        $shuttlesUsed: [ShuttlesUsedInput]
        $winner: Winner
        $status: Status
    ) {
        updateGame(
            input: {
                _id: $id
                start: $start
                session: $session
                end: $end
                A1: $A1
                A2: $A2
                B1: $B1
                B2: $B2
                court: $court
                shuttlesUsed: $shuttlesUsed
                winner: $winner
                status: $status
            }
        ) {
            _id
            start
            end
            winner
            status
            active
        }
    }
`

const FETCH_USERS = gql`
    query FetchUsers {
        fetchUsers {
            _id
            name
        }
    }
`

const FETCH_COURTS = gql`
    query FetchCourts {
        fetchCourts {
            _id
            name
            price
            active
            createdAt
            updatedAt
        }
    }
`

const FETCH_SHUTTLES = gql`
    query FetchShuttles {
        fetchShuttles {
            _id
            name
            price
            active
            createdAt
            updatedAt
        }
    }
`

const ShuttleUsedSchema = z.object({
    quantity: z.number().int(),
    shuttle: z.string(),
})

const GameSchema = z.object({
    players: z.array(z.string().nonempty('Player is required.')),
    court: z.string().nonempty('Court is required.'),
    shuttles: z.array(ShuttleUsedSchema).default([]).optional(),
    session: z.string().nonempty('Session is required.'),
    start: z.string().nullable(),
    end: z.string().nullable(),
})

const GameForm = ({
    sessionId,
    id,
    refetch,
}: {
    sessionId: string
    id?: string
    refetch?: () => void
}) => {
    const [open, setOpen] = useState<boolean>(false)
    const [isPending, startTransition] = useTransition()
    const { data } = useQuery(FETCH_GAME, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'network-only',
    })
    const { data: userData, loading: usersLoading } = useQuery(FETCH_USERS)
    const { data: courtData, loading: courtsLoading } = useQuery(FETCH_COURTS)
    const { data: shuttleData, loading: shuttlesLoading } =
        useQuery(FETCH_SHUTTLES)
    const [submitForm] = useMutation(id ? UPDATE_GAME : CREATE_GAME)

    const form = useForm<z.infer<typeof GameSchema>>({
        resolver: zodResolver(GameSchema),
        values: {
            players: ['', '', '', ''],
            court: '',
            shuttles: [
                {
                    quantity: 0,
                    shuttle: '',
                },
            ],
            session: sessionId || '',
            start: null,
            end: null,
        },
    })
    const {
        fields: shuttles,
        append: addShuttle,
        remove: removeShuttle,
    } = useFieldArray<any>({
        control: form.control,
        name: 'shuttles',
    })

    useEffect(() => {
        if (data) {
            const game = data.fetchGame
            form.reset({
                session: sessionId,
                court: game.court._id,
                players: [
                    game.A1._id,
                    game.A2?._id ?? '',
                    game.B1._id,
                    game.B2?._id ?? '',
                ],
                shuttles:
                    !!game.shuttlesUsed && game.shuttlesUsed?.length > 0
                        ? game.shuttlesUsed.map((shuttle: any) => ({
                              quantity: shuttle.quantity,
                              shuttle: shuttle.shuttle._id,
                          }))
                        : [
                              {
                                  quantity: 0,
                                  shuttle: '',
                              },
                          ],
                start: game.start
                    ? new Date(game.start).toLocaleString('en-US', {
                          timeZone: 'Asia/Manila',
                      })
                    : null,
                end: game.end
                    ? new Date(game.end).toLocaleString('en-US', {
                          timeZone: 'Asia/Manila',
                      })
                    : null,
            })
        }
    }, [data, form, sessionId])

    const handleSubmit = async (data: z.infer<typeof GameSchema>) => {
        startTransition(async () => {
            const { players, court, shuttles, start, end } = data
            const currentDate = new Date().toISOString().split('T')[0]

            const parseTime = (timeStr: string | null) => {
              if (!timeStr) return null;
              const [time, period] = timeStr.split(' '); 
              const [hours, minutes] = time.split(':'); 
              const hours24 = period === 'AM'
                ? hours === '12' ? '00' : hours
                : hours === '12' ? '12' : String(Number(hours) + 12);
              return new Date(`${currentDate}T${hours24}:${minutes}:00`);
            }

            const startDate = parseTime(start)
            const endDate = parseTime(end)
            try {
                const gameInput = {
                    start: startDate,
                    end: endDate,
                    session: sessionId,
                    A1: players[0],
                    A2: players[1] || null,
                    B1: players[2],
                    B2: players[3] || null,
                    court,
                    shuttlesUsed:
                        shuttles?.length === 1 && !shuttles[0].shuttle
                            ? []
                            : shuttles,
                    winner: null,
                }

                try {
                    const response = await submitForm({
                        variables: id
                            ? { id, ...gameInput }
                            : { ...gameInput, status: 'ongoing' },
                    })

                    if (
                        response.data?.createGame ||
                        response.data?.updateGame
                    ) {
                        closeForm()
                    }
                } catch (error) {
                    console.error('Error creating game:', error)
                }
            } catch (error) {
                console.error('Error creating game:', error)
            }
        })
    }

    const closeForm = () => {
        setOpen(false)
        form.clearErrors()
        form.reset()
        if (refetch) refetch()
    }

    if (usersLoading || courtsLoading || shuttlesLoading) return <Loader2 />

    return (
        <Sheet open={open} onOpenChange={setOpen} modal>
            <SheetTrigger asChild>
                <Button className={id ? undefined : 'w-full'}>
                    {id ? 'Update Game' : 'Add Game'}
                </Button>
            </SheetTrigger>
            <SheetContent
                side="bottom"
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="w-screen max-h-[calc(100vh-100px)] flex flex-col overflow-auto"
            >
                <SheetHeader>
                    <SheetTitle>{id ? 'Update Game' : 'Add Game'}</SheetTitle>
                    <SheetDescription>
                        Please fill up the necessary information below.
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form
                        className="flex-1 overflow-auto px-1 -mx-1 flex flex-col gap-1"
                        onSubmit={form.handleSubmit(handleSubmit)}
                    >
                        {[
                            'Player A1',
                            'Player A2',
                            'Player B1',
                            'Player B2',
                        ].map((label, index) => (
                            <FormField
                                key={label}
                                control={form.control}
                                name={`players.${index}`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{label}</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value
                                                    )
                                                }
                                                className="text-sm w-full border border-gray-300 rounded p-2"
                                                disabled={isPending}
                                            >
                                                <option value="">
                                                    Select Player
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
                                        <FormMessage />
                                        {(label === 'Player A2' ||
                                            label === 'Player B2') && (
                                            <Separator className="!my-4" />
                                        )}
                                    </FormItem>
                                )}
                            />
                        ))}

                        {/* Time Picker */}
                        <div className="flex space-x-4 justify-between">
                            <FormField
                                control={form.control}
                                name="start"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center space-x-2">
                                                <TimePicker
                                                    id="start"
                                                    value={field.value || ''}
                                                    onChange={(newTime) =>
                                                        field.onChange(newTime)
                                                    }
                                                    ariaLabel="Start Time"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center space-x-2">
                                                <TimePicker
                                                    id="end"
                                                    value={field.value || ''}
                                                    onChange={(newTime) =>
                                                        field.onChange(newTime)
                                                    }
                                                    ariaLabel="End Time"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Time Picker */}

                        <FormField
                            control={form.control}
                            name="court"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Court</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            className="text-sm w-full border border-gray-300 rounded p-2"
                                            disabled={isPending}
                                        >
                                            <option value="">
                                                Select Court
                                            </option>
                                            {courtData?.fetchCourts.map(
                                                (court: any) => (
                                                    <option
                                                        key={court._id}
                                                        value={court._id}
                                                    >
                                                        {court.name} -{' '}
                                                        {court.price.toFixed(2)}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {shuttles.map((_, index) => {
                            const isFirst = index === 0
                            return (
                                <div
                                    className="grid grid-cols-12 gap-x-2 items-end"
                                    key={index}
                                >
                                    <FormField
                                        control={form.control}
                                        name={`shuttles.${index}.shuttle`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-8">
                                                <FormLabel>Shuttle</FormLabel>
                                                <FormControl>
                                                    <select
                                                        {...field}
                                                        className="text-sm w-full border border-gray-300 rounded p-2"
                                                        disabled={isPending}
                                                    >
                                                        <option value="">
                                                            Select Shuttle
                                                        </option>
                                                        {shuttleData?.fetchShuttles.map(
                                                            (shuttle: any) => (
                                                                <option
                                                                    key={
                                                                        shuttle._id
                                                                    }
                                                                    value={
                                                                        shuttle._id
                                                                    }
                                                                >
                                                                    {
                                                                        shuttle.name
                                                                    }{' '}
                                                                    -{' '}
                                                                    {shuttle.price.toFixed(
                                                                        2
                                                                    )}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`shuttles.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-3">
                                                <FormLabel>Quantity</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="icon"
                                                            type="button"
                                                            className="w-20"
                                                            onClick={() => {
                                                                if (
                                                                    field.value <=
                                                                    0
                                                                )
                                                                    return
                                                                field.onChange(
                                                                    +field.value -
                                                                        1
                                                                )
                                                            }}
                                                        >
                                                            <Minus size={16} />
                                                        </Button>
                                                        <input
                                                            {...field}
                                                            className="text-sm w-full border border-gray-300 rounded p-2"
                                                            disabled={isPending}
                                                            type="number"
                                                            min={0}
                                                            step={1}
                                                            readOnly
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .value ===
                                                                        ''
                                                                        ? ''
                                                                        : +e
                                                                              .target
                                                                              .value
                                                                )
                                                            }
                                                        />
                                                        <Button
                                                            size="icon"
                                                            type="button"
                                                            className="w-20"
                                                            onClick={() => {
                                                                field.onChange(
                                                                    +field.value +
                                                                        1
                                                                )
                                                            }}
                                                        >
                                                            <Plus size={16} />
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={() => {
                                            if (isFirst) {
                                                form.setValue(
                                                    `shuttles.${index}.quantity`,
                                                    0
                                                )
                                                form.setValue(
                                                    `shuttles.${index}.shuttle`,
                                                    ''
                                                )
                                            } else {
                                                removeShuttle(index)
                                            }
                                        }}
                                        size="icon"
                                        className="flex items-center justify-center w-full"
                                    >
                                        <X className="text-destructive" />
                                    </Button>
                                </div>
                            )
                        })}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-green-800 text-green-800 mt-4"
                            onClick={() =>
                                addShuttle({
                                    quantity: 0,
                                    shuttle: '',
                                })
                            }
                        >
                            Add Shuttle
                        </Button>

                        <Button
                            type="submit"
                            className="mt-6 w-full"
                            disabled={isPending}
                        >
                            {isPending ? <ButtonLoader /> : 'Save Game'}
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
            </SheetContent>
        </Sheet>
    )
}

export default GameForm
