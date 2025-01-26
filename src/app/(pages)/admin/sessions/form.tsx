import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Loader from "@/components/custom/Loader";
import ButtonLoader from "@/components/custom/ButtonLoader";
import { Loader2, X } from "lucide-react";

const FETCH_SESSION = gql`
  query FetchSession($id: ID!) {
    fetchSession(_id: $id) {
      _id
      start
      end
      createdAt
      updatedAt
      games {
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
        court {
          _id
          name
          price
          active
        }
        shuttlesUsed {
          quantity
          shuttle {
            _id
            name
            price
          }
        }
      }
    }
  }
`;
const CREATE_GAME = gql`
  mutation CreateGame($input: GameInput!) {
    createGame(input: $input) {
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
        username
        role
        active
      }
      A2 {
        _id
        name
        contact
        username
        role
        active
      }
      B1 {
        _id
        name
        contact
        username
        role
        active
      }
      B2 {
        _id
        name
        contact
        username
        role
        active
      }
      court {
        _id
        name
        price
        active
      }
      shuttlesUsed {
        quantity
        shuttle {
          _id
          name
          price
        }
      }
    }
  }
`;

const FETCH_USERS = gql`
  query FetchUsers {
    fetchUsers {
      _id
      name
    }
  }
`;

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
`;

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
`;

const GameSchema = z.object({
  players: z.array(z.string().nonempty("Player is required.")),
  court: z.string().nonempty("Court is required."),
  shuttle: z.array(z.string().nonempty("At least one shuttle is required.")),
  session: z.string().nonempty("Session is required."),
  // end: z.string().optional(),
  // start: z.string().optional(),
  // winner: z.string().optional(),
});

const SessionForm = ({
  id,
  refetch,
}: {
  id?: string;
  refetch?: () => void;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const { data, loading } = useQuery(FETCH_SESSION, {
    variables: { id },
    skip: !id,
    fetchPolicy: "network-only",
  });
  const { data: userData, loading: usersLoading } = useQuery(FETCH_USERS);
  const { data: courtData, loading: courtsLoading } = useQuery(FETCH_COURTS);
  const {
    data: shuttleData,
    loading: shuttlesLoading,
    refetch: refetchShuttles,
  } = useQuery(FETCH_SHUTTLES);
  const [createGame] = useMutation(CREATE_GAME, {
    update(cache, { data: { createGame } }) {
      if (!createGame) return;

      // Basahon ang existing nga data alang sa FETCH_SESSION gikan sa cache
      const existingSession: any = cache.readQuery({
        query: FETCH_SESSION,
        variables: { id },
      });
      if (existingSession?.fetchSession) {
        cache.writeQuery({
          query: FETCH_SESSION,
          variables: { id },
          data: {
            fetchSession: {
              ...existingSession.fetchSession,
              games: [...existingSession.fetchSession.games, createGame],
            },
          },
        });
      }
    },
  });

  const form = useForm<z.infer<typeof GameSchema>>({
    resolver: zodResolver(GameSchema),
    values: {
      players: ["", "", "", ""],
      court: "",
      shuttle: [""],
      session: id || "",
      // end: "",
      // start: "",
      // winner: "",
    },
  });

  const [shuttles, setShuttles] = useState<string[]>(["0"]);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const handleAddShuttle = () => {
    setShuttles([...shuttles, "0"]);
    refetchShuttles();
  };
  const handleRemoveShuttle = (index: number) => {
    const newShuttles = [...shuttles];
    newShuttles.splice(index, 1);
    setShuttles(newShuttles);
    refetchShuttles();
  };

  // useEffect(() => {
  //   if (data) {
  //     form.reset(data?.fetchSession)
  //   }
  // }, [data, form])

  const handleSubmit = async (data: z.infer<typeof GameSchema>) => {
    startTransition(async () => {
      const { players, court, shuttle } = data;
      try {
        const gameInput = {
          start: new Date(),
          session: id,
          A1: players[0],
          A2: players[1] || null,
          B1: players[2],
          B2: players[3] || null,
          court,
          shuttlesUsed: shuttle.map((shuttleId) => ({
            shuttle: shuttleId,
            quantity: parseInt(shuttles[shuttle.indexOf(shuttleId)] || "1"),
          })),
          end: null,
          winner: null,
          status: "ongoing",
        };

        console.log("Game Input:", gameInput, "test", form.getValues());

        try {
          const response = await createGame({
            variables: { input: gameInput },
          });

          if (response?.data?.createGame) {
            const createdGame = response.data.createGame;
            console.log("Game Created:", createdGame);

            if (refetch) {
              refetch();
            }
            closeForm();
          } else {
            console.error("Invalid response from createGame:", response);
          }
        } catch (error) {
          console.error("Error creating game:", error);
        }
      } catch (error) {
        console.error("Error creating game:", error);
      }
    });
  };

  const closeForm = () => {
    setOpen(false);
    form.clearErrors();
    if (refetch) refetch();
  };

  if (usersLoading || courtsLoading || shuttlesLoading) return <Loader2 />;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full">{id ? "Add Game" : ""}</Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-screen max-h-[calc(100vh-100px)] flex flex-col overflow-auto"
      >
        <SheetHeader>
          <SheetTitle>{id ? "Add Game" : ""}</SheetTitle>
          <SheetDescription>
            Please fill up the necessary information below.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            className="flex-1 overflow-auto px-1 -mx-1"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {["Player A1", "Player A2", "Player B1", "Player B2"].map(
              (label, index) => (
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
                          onChange={(e) => field.onChange(e.target.value)}
                          className="text-sm w-full border border-gray-300 rounded p-2"
                          disabled={isPending}
                        >
                          <option value="">Select Player</option>
                          {userData?.fetchUsers.map((user: any) => (
                            <option key={user._id} value={user._id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            )}
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
                      <option value="">Select Court</option>
                      {courtData?.fetchCourts.map((court: any) => (
                        <option key={court._id} value={court._id}>
                          {court.name} - ${court.price}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              {shuttles.map((shuttleId, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`shuttle.${index}`}
                  render={({ field }) => (
                    <FormItem
                      className={`flex items-center space-x-2 ${
                        index > 0 ? "mt-3" : ""
                      }`}
                    >
                      <FormControl className="flex-1 flex items-center">
                        <div className="flex items-center w-full space-x-2">
                          <div className="flex flex-col flex-grow">
                            <FormLabel className="text-sm mt-2">
                              Shuttle
                            </FormLabel>
                            <select
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="text-sm w-full border border-gray-300 rounded p-2"
                              disabled={isPending}
                            >
                              <option value="">Select Shuttle</option>
                              {shuttleData?.fetchShuttles.map(
                                (shuttle: any) => (
                                  <option key={shuttle._id} value={shuttle._id}>
                                    {shuttle.name} - ${shuttle.price}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div className="flex flex-col items-center">
                            <FormLabel className="text-sm mt-2">
                              Quantity
                            </FormLabel>
                            <div className="flex items-center space-x-1 bg-gray-300 rounded-md">
                              <button
                                type="button"
                                onClick={() => {
                                  if (parseInt(shuttles[index] || "0") > 0) {
                                    const updatedShuttles = [...shuttles];
                                    updatedShuttles[index] = (
                                      parseInt(updatedShuttles[index] || "0") -
                                      1
                                    ).toString();
                                    setShuttles(updatedShuttles);
                                  }
                                }}
                                className="p-1 text-xs text-gray-600 hover:bg-gray-400 rounded-l-md"
                              >
                                -
                              </button>
                              <input
                                type="text"
                                readOnly
                                value={shuttles[index]}
                                className="text-center bg-gray-100 w-8 text-sm border-none outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedShuttles = [...shuttles];
                                  updatedShuttles[index] = (
                                    parseInt(updatedShuttles[index] || "0") + 1
                                  ).toString();
                                  setShuttles(updatedShuttles);
                                }}
                                className="p-1 text-xs text-gray-600 hover:bg-gray-400 rounded-r-md"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveShuttle(index)}
                          className="mt-6"
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </FormItem>
                  )}
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="mt-4"
                onClick={handleAddShuttle}
              >
                Add Shuttle
              </Button>
            </div>
            <Button type="submit" className="mt-6 w-full" disabled={isPending}>
              {isPending ? <ButtonLoader /> : "Save Game"}
            </Button>
          </form>
        </Form>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="ghost">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SessionForm;
