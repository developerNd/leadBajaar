import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const recentLeads = [
  {
    name: "John Doe",
    email: "john@example.com",
    status: "New",
    date: "2023-06-01",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    status: "Contacted",
    date: "2023-05-30",
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    status: "Qualified",
    date: "2023-05-29",
  },
  {
    name: "Alice Brown",
    email: "alice@example.com",
    status: "New",
    date: "2023-05-28",
  },
  {
    name: "Charlie Davis",
    email: "charlie@example.com",
    status: "Contacted",
    date: "2023-05-27",
  },
]

export function RecentLeads() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentLeads.map((lead) => (
          <TableRow key={lead.email}>
            <TableCell>{lead.name}</TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell>{lead.status}</TableCell>
            <TableCell>{lead.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

