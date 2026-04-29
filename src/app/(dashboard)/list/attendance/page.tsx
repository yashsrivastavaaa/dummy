import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getCurrentUserFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Attendance, Class, Lesson, Prisma, Student, Subject } from "@prisma/client";
import Image from "next/image";

type AttendanceList = Attendance & {
  student: Student & { class: Class };
  lesson: Lesson & { subject: Subject };
};

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await getCurrentUserFromCookie();
  const role = user?.role;
  const currentUserId = user?.id;

  const columns = [
    {
      header: "Student",
      accessor: "student",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Lesson",
      accessor: "lesson",
    },
    {
      header: "Subject",
      accessor: "subject",
      className: "hidden md:table-cell",
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

  const renderRow = (item: AttendanceList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {item.student.name + " " + item.student.surname}
      </td>
      <td className="hidden md:table-cell">{item.student.class.name}</td>
      <td>{item.lesson.name}</td>
      <td className="hidden md:table-cell">{item.lesson.subject.name}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.date)}
      </td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.present
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.present ? "Present" : "Absent"}
        </span>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.AttendanceWhereInput = {};
  const andConditions: Prisma.AttendanceWhereInput[] = [];

  if (queryParams.search) {
    andConditions.push({
      OR: [
        {
          student: {
            name: { contains: queryParams.search, mode: "insensitive" },
          },
        },
        {
          student: {
            surname: { contains: queryParams.search, mode: "insensitive" },
          },
        },
        {
          student: {
            class: { name: { contains: queryParams.search, mode: "insensitive" } },
          },
        },
        {
          lesson: {
            name: { contains: queryParams.search, mode: "insensitive" },
          },
        },
        {
          lesson: {
            subject: {
              name: { contains: queryParams.search, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

  switch (role) {
    case "teacher":
      andConditions.push({ lesson: { teacherId: currentUserId! } });
      break;
    case "student":
      andConditions.push({ studentId: currentUserId! });
      break;
    case "parent":
      andConditions.push({ student: { parentId: currentUserId! } });
      break;
    default:
      break;
  }

  if (andConditions.length > 0) {
    query.AND = andConditions;
  }

  const [data, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true, class: true } },
        lesson: { select: { name: true, subject: { select: { name: true } } } },
      },
      orderBy: { date: "desc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.attendance.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Attendance</h1>
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
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AttendanceListPage;
