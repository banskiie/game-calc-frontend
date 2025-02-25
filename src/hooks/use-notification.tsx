import { toast } from "sonner"

// const audio = new Audio("/request.mp3")

const useNotification = ({
  title,
  description,
  type,
}: {
  title: string
  description: string
  type: "success" | "error" | "warning" | "info"
}) => {
  toast[type](`New ${title} Notification`, { description })
  // audio.play()
}

export default useNotification
