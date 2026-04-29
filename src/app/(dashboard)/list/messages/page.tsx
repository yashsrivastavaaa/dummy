import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";

type MessageItem = {
  id: number;
  from: string;
  role: string;
  subject: string;
  date: string;
  status: "unread" | "read";
};

const demoMessages: MessageItem[] = [
  {
    id: 1,
    from: "Office",
    role: "admin",
    subject: "Updated schedule for next week",
    date: "2026-04-28",
    status: "unread",
  },
  {
    id: 2,
    from: "Mr. Hudson",
    role: "teacher",
    subject: "Assignment 4 feedback",
    date: "2026-04-26",
    status: "read",
  },
  {
    id: 3,
    from: "Admissions",
    role: "admin",
    subject: "Parent-teacher meeting invite",
    date: "2026-04-25",
    status: "read",
  },
  {
    id: 4,
    from: "Ms. Patel",
    role: "teacher",
    subject: "Homework reminder",
    date: "2026-04-24",
    status: "unread",
  },
  {
    id: 5,
    from: "Library",
    role: "admin",
    subject: "Book return notice",
    date: "2026-04-23",
    status: "read",
  },
  {
    id: 6,
    from: "Math Dept",
    role: "teacher",
    subject: "Quiz schedule update",
    date: "2026-04-22",
    status: "read",
  },
  {
    id: 7,
    from: "Sports",
    role: "admin",
    subject: "Practice time change",
    date: "2026-04-21",
    status: "unread",
  },
];

const MessagesListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await getCurrentUserFromCookie();
  const role = user?.role;

  const columns = [
    {
      header: "From",
      accessor: "from",
    },
    {
      header: "Role",
      accessor: "role",
      className: "hidden md:table-cell",
    },
    {
      header: "Subject",
      accessor: "subject",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
    },
  ];

  const renderRow = (item: MessageItem) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.from}</td>
      <td className="hidden md:table-cell capitalize">{item.role}</td>
      <td>{item.subject}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(new Date(item.date))}
      </td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.status === "unread"
              ? "bg-lamaYellowLight text-yellow-700"
              : "bg-lamaSkyLight text-blue-700"
          }`}
        >
          {item.status === "unread" ? "Unread" : "Read"}
        </span>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const search = queryParams.search?.toLowerCase().trim() || "";
  const roleFiltered = role
    ? demoMessages.filter((message) =>
        role === "admin" ? true : message.role !== "admin"
      )
    : demoMessages;

  const filtered = search
    ? roleFiltered.filter(
        (message) =>
          message.from.toLowerCase().includes(search) ||
          message.subject.toLowerCase().includes(search)
      )
    : roleFiltered;

  const count = filtered.length;
  const start = ITEM_PER_PAGE * (p - 1);
  const data = filtered.slice(start, start + ITEM_PER_PAGE);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Messages</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      {/* LIST */}
      {data.length > 0 ? (
        <Table columns={columns} renderRow={renderRow} data={data} />
      ) : (
        <div className="mt-6 text-sm text-gray-500">No messages found.</div>
      )}
      {/* PAGINATION */}
      {count > ITEM_PER_PAGE && <Pagination page={p} count={count} />}
    </div>
  );
};

export default MessagesListPage;
