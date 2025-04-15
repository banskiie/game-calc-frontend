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
} from '@/components/ui/sheet'
import { gql, useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState, useTransition } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import ButtonLoader from '@/components/custom/ButtonLoader'
import { Clock, Loader2, Minus, Plus, SquarePen, X } from 'lucide-react'
import { format, toZonedTime } from 'date-fns-tz'
import { parse } from 'date-fns'
import TimePicker from '@/components/custom/timepicker'
import { toast } from 'sonner'

const FETCH_SESSION = gql`
    query FetchSession($id: ID!) {
        fetchSession(_id: $id) {
            _id
            games {
                _id
                end
            }
            court {
                _id
                name
            }
            shuttle {
                _id
                name
            }
            availablePlayers {
                _id
                name
            }
        }
    }
`

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
    players: z
        .array(z.string().optional())
        .refine((players) => players[0] && players[2], {
            message: 'Player A1 and Player B1 are required.',
        }),
    court: z.string().nonempty('Court is required.'),
    shuttles: z.array(ShuttleUsedSchema).default([]).optional(),
    session: z.string().nonempty('Session is required.'),
    start: z.string().nullable(),
    end: z.string().nullable(),
    winner: z.enum(['a', 'b']).optional(),
})

const GameForm = ({
    sessionId,
    id,
    refetch,
    disabled,
}: {
    sessionId: string
    id?: string
    refetch?: () => void
    disabled?: boolean
}) => {
    const [open, setOpen] = useState<boolean>(false)
    const [isPending, startTransition] = useTransition()
    const { data } = useQuery(FETCH_GAME, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'network-only',
    })
    const { data: sessionData, refetch: refetchSession } = useQuery(
        FETCH_SESSION,
        {
            variables: { id: sessionId },
            skip: !sessionId,
            fetchPolicy: 'network-only',
        }
    )
    const { loading: usersLoading } = useQuery(FETCH_USERS)
    const { data: courtData, loading: courtsLoading } = useQuery(FETCH_COURTS)
    const { data: shuttleData, loading: shuttlesLoading } =
        useQuery(FETCH_SHUTTLES)
    const [submitForm] = useMutation(id ? UPDATE_GAME : CREATE_GAME)
    const [_isClosing, setIsClosing] = useState(false)
    // const prevStartTime = useRef<string | null>(null)
    const form = useForm<z.infer<typeof GameSchema>>({
        resolver: zodResolver(GameSchema),
        values: {
            players: ['', '', '', ''],
            court: '',
            shuttles: [
                {
                    quantity: 1,
                    shuttle: '',
                },
            ],
            session: sessionId || '',
            start: null,
            end: null,
            winner: undefined,
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
        if (open && refetch) {
            refetchSession().then(() => {
                const games = sessionData?.fetchSession?.games || []
                const lastGame = games[games.length - 1]

                let newStart = '05:00 PM'
                if (lastGame?.end) {
                    const lastEnd = new Date(lastGame.end)
                    lastEnd.setMinutes(lastEnd.getMinutes() + 1)
                    newStart = format(
                        toZonedTime(lastEnd, 'Asia/Manila'),
                        'hh:mm a'
                    )
                }

                // Set the start time
                form.setValue('start', newStart)

                // Set the end time based on the start time
                const timeParts = newStart.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/)
                if (timeParts) {
                    const hour = timeParts[1]
                    const ampm = timeParts[3]
                    const endTime = `${hour}:00 ${ampm}`
                    form.setValue('end', endTime, { shouldValidate: true })
                }
            })
        }
    }, [open, refetch, refetchSession, sessionData, form])

    const getAvailablePlayers = (currentIndex: number) => {
        const selectedPlayers = form.watch('players')
        const availablePlayers =
            sessionData?.fetchSession?.availablePlayers || []

        return availablePlayers
            .filter(
                (user: any) =>
                    !selectedPlayers.includes(user._id) ||
                    selectedPlayers[currentIndex] === user._id
            )
            .sort((a: any, b: any) => a.name.localeCompare(b.name)) //Sort the name A to Z
    }

    const startTime = useWatch({ control: form.control, name: 'start' })
    useEffect(() => {
        // Only apply ni sa new games (pag walay id)
        if (!id && startTime) {
            const timeParts = startTime.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/)
            if (timeParts) {
                const hour = timeParts[1]
                const ampm = timeParts[3]

                // Set the end time to match the hour of the start time with "00" and the same AM/PM
                const endTime = `${hour}:00 ${ampm}`
                form.setValue('end', endTime, { shouldValidate: true })
            }
        }
    }, [startTime, form, id])

    useEffect(() => {
        if (!id && sessionData?.fetchSession?.games) {
            const games = sessionData.fetchSession.games
            const lastGame = games[games.length - 1]

            let newStart = '05:00 PM'
            if (lastGame?.end) {
                const lastEnd = new Date(lastGame.end)
                lastEnd.setMinutes(lastEnd.getMinutes() + 1)
                newStart = format(
                    toZonedTime(lastEnd, 'Asia/Manila'),
                    'hh:mm a'
                )
            }

            // Set the start time
            form.setValue('start', newStart)

            // Set the end time based on the start time
            const timeParts = newStart.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/)
            if (timeParts) {
                const hour = timeParts[1]
                const ampm = timeParts[3]
                const endTime = `${hour}:00 ${ampm}`
                form.setValue('end', endTime, { shouldValidate: true })
            }
        }
    }, [sessionData, id, form, sessionData?.fetchSession?.games?.length])

    useEffect(() => {
        if (data && open) {
            const game = data.fetchGame

            const ensurePM = (time: Date | null) => {
                if (!time) return null
                const zonedTime = toZonedTime(time, 'Asia/Manila')
                return format(zonedTime, 'hh:mm a')
            }

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
                    game.shuttlesUsed?.length > 0
                        ? game.shuttlesUsed.map((shuttle: any) => ({
                              quantity: shuttle.quantity,
                              shuttle: shuttle.shuttle._id,
                          }))
                        : [
                              {
                                  quantity: 1,
                                  shuttle:
                                      game.shuttlesUsed?.[0]?.shuttle._id || '',
                              },
                          ],
                start: ensurePM(game.start) || '05:00 PM',
                end: ensurePM(game.end) || '00:00 PM',
                winner: game.winner || undefined,
            })
        }
    }, [data, form, sessionId, open])

    useEffect(() => {
        if (
            !id &&
            sessionData &&
            sessionData.fetchSession &&
            courtData &&
            shuttleData
        ) {
            const { court, shuttle } = sessionData.fetchSession

            form.reset({
                ...form.getValues(),
                court: court._id,
                shuttles: [
                    {
                        shuttle: shuttle._id,
                        quantity: 1,
                    },
                ],
            })
        }
    }, [sessionData, courtData, shuttleData, form, id])

    const handleSubmit = async (data: z.infer<typeof GameSchema>) => {
        if (disabled) return
        startTransition(async () => {
            const { players, court, shuttles, start, end } = data

            try {
                const gameInput = {
                    start: start ? parse(start, 'hh:mm a', new Date()) : null,
                    end: end ? parse(end, 'hh:mm a', new Date()) : null,
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
                    winner: data.winner || null,
                }

                const response = await submitForm({
                    variables: id
                        ? { id, ...gameInput }
                        : { ...gameInput, status: 'ongoing' },
                })

                if (response.data?.createGame || response.data?.updateGame) {
                    // Only refetch if we're not in edit mode
                    if (!id) {
                        await refetchSession()
                    }

                    if (refetch) {
                        await refetch()
                    }

                    toast.success(
                        id
                            ? 'Game updated successfully!'
                            : 'Game created successfully!'
                    )

                    // Don't reset the form if we're in edit mode
                    if (!id) {
                        const updatedSession = sessionData?.fetchSession
                        const games = updatedSession?.games || []
                        const lastGame = games[games.length - 1]

                        let newStart = '05:00 PM'
                        if (lastGame?.end) {
                            const lastEnd = new Date(lastGame.end)
                            lastEnd.setMinutes(lastEnd.getMinutes() + 1)
                            newStart = format(
                                toZonedTime(lastEnd, 'Asia/Manila'),
                                'hh:mm a'
                            )
                        }

                        form.reset({
                            players: ['', '', '', ''],
                            court: updatedSession?.court?._id || '',
                            shuttles: [
                                {
                                    quantity: 1,
                                    shuttle: updatedSession?.shuttle?._id || '',
                                },
                            ],
                            start: newStart,
                            end: '00:00 PM',
                        })
                    }
                    closeForm()
                }
            } catch (error) {
                toast.error('Failed to save game. Please try again.')
                console.log(error)
            }
        })
    }

    const closeForm = () => {
        setIsClosing(true)
      

        if (!id) {
            const defaultCourt = sessionData?.fetchSession?.court?._id || ''
            const defaultShuttle = sessionData?.fetchSession?.shuttle?._id || ''
            const games = sessionData?.fetchSession?.games || []
            const lastGame = games[games.length - 1]

            let newStart = '05:00 PM'
            if (lastGame?.end) {
                const lastEnd = new Date(lastGame.end)
                lastEnd.setMinutes(lastEnd.getMinutes() + 1)
                newStart = format(
                    toZonedTime(lastEnd, 'Asia/Manila'),
                    'hh:mm a'
                )
            }

            form.reset({
                players: ['', '', '', ''],
                court: defaultCourt,
                shuttles: [{ quantity: 1, shuttle: defaultShuttle }],
                session: sessionId || '',
                start: newStart,
                end: '00:00 PM',
                winner: undefined,
            })
        }
        setOpen(false)
        setTimeout(() => setIsClosing(false), 500)
    }

    if (usersLoading || courtsLoading || shuttlesLoading) return <Loader2 />

    return (
        <Sheet open={open} onOpenChange={(open) => {
            if(!open) closeForm()
                else setOpen(true)
        }} modal>
            <SheetTrigger asChild>
                <Button
                    className={`${
                        id
                            ? 'bg-green-600 hover:bg-green-700 text-white h-10 w-10 rounded-full flex items-center justify-center'
                            : 'bg-green-500 hover:bg-green-600 text-white rounded-l-3xl h-10 w-20 flex justify-center align-center'
                    }`}
                    disabled={disabled}
                >
                    {id ? (
                        <SquarePen className="!w-6 !h-6" />
                    ) : (
                        <Plus className="!w-6 !h-6" />
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent
                side="bottom"
                onOpenAutoFocus={(e) => e.preventDefault()}
                className=" !max-w-xl mx-auto w-full flex flex-col overflow-auto"
            >
                <div
                    style={{
                        maxWidth: '600px',
                        margin: '0 auto',
                        width: '100%',
                        padding: '0 16px',
                    }}
                >
                    <SheetHeader>
                        <SheetTitle>
                            {id ? 'Update Game' : 'Add Game'}
                        </SheetTitle>
                        <SheetDescription className="text-base">
                            Please fill up the necessary information below.
                        </SheetDescription>
                    </SheetHeader>
                    <Form {...form}>
                        <form
                            className="flex-1 overflow-auto px-1 -mx-1 flex flex-col gap-1"
                            onSubmit={form.handleSubmit(handleSubmit)}
                        >
                            <div className="flex flex-row gap-2 mt-2">
                                <div className="flex flex-col gap-4 flex-1">
                                    {['Player A1', 'Player A2'].map(
                                        (label, index) => (
                                            <FormField
                                                key={label}
                                                control={form.control}
                                                name={`players.${index}`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base">
                                                            {label}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <select
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="text-base w-full border border-gray-300 rounded p-3"
                                                                disabled={
                                                                    isPending
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select
                                                                    Player
                                                                </option>
                                                                {getAvailablePlayers(
                                                                    index
                                                                ).map(
                                                                    (
                                                                        user: any
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                user._id
                                                                            }
                                                                            value={
                                                                                user._id
                                                                            }
                                                                        >
                                                                            {
                                                                                user.name
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        </FormControl>
                                                        {index === 0 && (
                                                            <FormMessage />
                                                        )}
                                                    </FormItem>
                                                )}
                                            />
                                        )
                                    )}
                                </div>

                                <div className="flex flex-col gap-4 flex-1 items-end">
                                    {['Player B1', 'Player B2'].map(
                                        (label, index) => (
                                            <FormField
                                                key={label}
                                                control={form.control}
                                                name={`players.${index + 2}`}
                                                render={({ field }) => (
                                                    <FormItem className="w-full text-left">
                                                        <FormLabel className="text-base">
                                                            {label}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <select
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="text-base w-full border border-gray-300 rounded p-3"
                                                                disabled={
                                                                    isPending
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select
                                                                    Player
                                                                </option>
                                                                {getAvailablePlayers(
                                                                    index + 2
                                                                ).map(
                                                                    (
                                                                        user: any
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                user._id
                                                                            }
                                                                            value={
                                                                                user._id
                                                                            }
                                                                        >
                                                                            {
                                                                                user.name
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        </FormControl>
                                                        {index === 0 && (
                                                            <FormMessage />
                                                        )}
                                                    </FormItem>
                                                )}
                                            />
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Clock className="h-5 w-5 text-muted-foreground" />{' '}
                                        <label className="text-base block mb-1">
                                            Start Time
                                        </label>
                                    </div>
                                    <TimePicker
                                        initialTime={
                                            form.getValues('start') ||
                                            '05:00 PM'
                                        }
                                        onChange={(newTime) => {
                                            form.setValue('start', newTime)
                                        }}
                                    />
                                </div>

                                <div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Clock className="h-5 w-5 text-muted-foreground" />{' '}
                                        <label className="text-base block mb-1">
                                            End Time
                                        </label>
                                    </div>

                                    <TimePicker
                                        initialTime={
                                            form.getValues('end') || '00:00 PM'
                                        }
                                        onChange={(newTime) => {
                                            form.setValue('end', newTime)
                                        }}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="court"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Court
                                        </FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="text-base w-full border border-gray-300 rounded p-2"
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
                                                            {court.price.toFixed(
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
                                                    <FormLabel className="text-base">
                                                        Shuttle
                                                    </FormLabel>
                                                    <FormControl>
                                                        <select
                                                            {...field}
                                                            className="text-base w-full border border-gray-300 rounded p-2"
                                                            disabled={isPending}
                                                        >
                                                            <option value="">
                                                                Select Shuttle
                                                            </option>
                                                            {shuttleData?.fetchShuttles.map(
                                                                (
                                                                    shuttle: any
                                                                ) => (
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
                                                    <FormLabel className="text-base">
                                                        Quantity
                                                    </FormLabel>
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
                                                                <Minus
                                                                    size={18}
                                                                />
                                                            </Button>
                                                            <input
                                                                {...field}
                                                                className="text-base w-full border border-gray-300 rounded p-2"
                                                                disabled={
                                                                    isPending
                                                                }
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
                                                                <Plus
                                                                    size={18}
                                                                />
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
                                            <X className="text-destructive !w-7 !h-7" />
                                        </Button>
                                    </div>
                                )
                            })}

                            {id && (
                                <FormField
                                    control={form.control}
                                    name="winner"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                Winner
                                            </FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="text-base w-full border border-gray-300 rounded p-2"
                                                    disabled={isPending}
                                                >
                                                    <option value="">
                                                        Select Winner
                                                    </option>
                                                    <option value="a">
                                                        Team A
                                                    </option>
                                                    <option value="b">
                                                        Team B
                                                    </option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-green-800 text-green-800 mt-4 text-base"
                                onClick={() =>
                                    addShuttle({
                                        quantity: 0,
                                        shuttle: '',
                                    })
                                }
                            >
                                Add Shuttle
                            </Button>
                            <div className="flex flex-row mt-2 gap-4">
                                <Button
                                    type="submit"
                                    className="w-full !bg-green-800 !hover:bg-green-900 text-base"
                                    disabled={isPending}
                                >
                                    {isPending ? <ButtonLoader /> : 'Save Game'}
                                </Button>
                                <Button
                                    className="w-full font-bold bg-red-600 hover:bg-red-700"
                                    onClick={() => closeForm()}
                                    variant="ghost"
                                >
                                    <span className="text-white text-base">
                                        {' '}
                                        Close{' '}
                                    </span>
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default GameForm
