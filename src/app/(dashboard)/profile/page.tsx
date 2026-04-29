import { getCurrentUserFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";

const ProfilePage = async () => {
  const user = await getCurrentUserFromCookie();

  if (!user?.id || !user?.role) {
    return <div className="p-4">Not authenticated</div>;
  }

  const role = user.role;
  let profile:
    | {
        name: string;
        surname?: string;
        username: string;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
        img?: string | null;
        bloodType?: string | null;
        sex?: string | null;
        birthday?: Date | null;
        createdAt?: Date | null;
        className?: string | null;
        gradeLevel?: number | null;
        studentsCount?: number | null;
      }
    | null = null;

  switch (role) {
    case "admin": {
      const admin = await prisma.admin.findUnique({
        where: { id: user.id },
        select: { username: true },
      });
      profile = admin
        ? {
            name: "Administrator",
            username: admin.username,
          }
        : null;
      break;
    }
    case "teacher": {
      const teacher = await prisma.teacher.findUnique({
        where: { id: user.id },
        select: {
          name: true,
          surname: true,
          username: true,
          email: true,
          phone: true,
          address: true,
          img: true,
          bloodType: true,
          sex: true,
          birthday: true,
          createdAt: true,
        },
      });
      profile = teacher;
      break;
    }
    case "student": {
      const student = await prisma.student.findUnique({
        where: { id: user.id },
        select: {
          name: true,
          surname: true,
          username: true,
          email: true,
          phone: true,
          address: true,
          img: true,
          bloodType: true,
          sex: true,
          birthday: true,
          createdAt: true,
          class: { select: { name: true } },
          grade: { select: { level: true } },
        },
      });
      profile = student
        ? {
            ...student,
            className: student.class?.name,
            gradeLevel: student.grade?.level,
          }
        : null;
      break;
    }
    case "parent": {
      const parent = await prisma.parent.findUnique({
        where: { id: user.id },
        select: {
          name: true,
          surname: true,
          username: true,
          email: true,
          phone: true,
          address: true,
          createdAt: true,
          students: { select: { id: true } },
        },
      });
      profile = parent
        ? {
            ...parent,
            studentsCount: parent.students.length,
          }
        : null;
      break;
    }
    default:
      profile = null;
      break;
  }

  if (!profile) {
    return <div className="p-4">Profile not found.</div>;
  }

  const fullName = profile.surname
    ? `${profile.name} ${profile.surname}`
    : profile.name;

  const accountDetails = [
    { label: "Username", value: profile.username },
    { label: "Role", value: role },
    {
      label: "Created",
      value: profile.createdAt
        ? new Intl.DateTimeFormat("en-GB").format(profile.createdAt)
        : "-",
    },
    {
      label: "Students",
      value:
        typeof profile.studentsCount === "number"
          ? profile.studentsCount.toString()
          : "-",
    },
  ];

  const personalDetails = [
    { label: "Email", value: profile.email || "-" },
    { label: "Phone", value: profile.phone || "-" },
    { label: "Address", value: profile.address || "-" },
    { label: "Blood Type", value: profile.bloodType || "-" },
    { label: "Sex", value: profile.sex || "-" },
    {
      label: "Birthday",
      value: profile.birthday
        ? new Intl.DateTimeFormat("en-GB").format(profile.birthday)
        : "-",
    },
    { label: "Class", value: profile.className || "-" },
    {
      label: "Grade",
      value:
        typeof profile.gradeLevel === "number"
          ? `${profile.gradeLevel}th`
          : "-",
    },
  ];

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      <div className="bg-lamaSky py-6 px-4 rounded-md flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4">
          <Image
            src={profile.img || "/noAvatar.png"}
            alt=""
            width={144}
            height={144}
            className="w-36 h-36 rounded-full object-cover"
          />
        </div>
        <div className="w-full md:w-3/4 flex flex-col gap-2 justify-center">
          <h1 className="text-2xl font-semibold">{fullName}</h1>
          <p className="text-sm text-gray-500">{profile.username}</p>
          <span className="inline-flex w-fit px-3 py-1 text-xs font-semibold rounded-full bg-white text-gray-700">
            {role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold">Account Details</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {accountDetails.map((item) => (
              <div key={item.label}>
                <p className="text-gray-400 text-xs">{item.label}</p>
                <p className="font-medium text-gray-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold">Personal Details</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {personalDetails.map((item) => (
              <div key={item.label}>
                <p className="text-gray-400 text-xs">{item.label}</p>
                <p className="font-medium text-gray-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
