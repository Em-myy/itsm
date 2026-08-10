import Link from "next/link"


const NavBar = () => {
  return (
    <div>
      <Link href="/create-tickets">Create Tickets</Link>
      <Link href="/tickets">View Tickets</Link>
      <Link href="/calendar">Calendar</Link>
    </div>
  )
}

export default NavBar
