"use server";

import prisma from "./prisma";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";

async function findUserByUsernameAndPassword(username: string, password: string) {
    // Check in Admin table
    const admin = await prisma.admin.findUnique({
        where: { username },
        select: { id: true, username: true, password: true },
    });

    if (admin && admin.password) {
        const isValid = await bcrypt.compare(password, admin.password);
        if (isValid) {
            return { id: admin.id, username: admin.username, role: "admin" };
        }
    }

    // Check in Teacher table
    const teacher = await prisma.teacher.findUnique({
        where: { username },
        select: { id: true, username: true, name: true, surname: true, password: true },
    });

    if (teacher && teacher.password) {
        const isValid = await bcrypt.compare(password, teacher.password);
        if (isValid) {
            return { id: teacher.id, username: teacher.username, name: teacher.name, surname: teacher.surname, role: "teacher" };
        }
    }

    // Check in Student table
    const student = await prisma.student.findUnique({
        where: { username },
        select: { id: true, username: true, name: true, surname: true, password: true },
    });

    if (student && student.password) {
        const isValid = await bcrypt.compare(password, student.password);
        if (isValid) {
            return { id: student.id, username: student.username, name: student.name, surname: student.surname, role: "student" };
        }
    }

    // Check in Parent table
    const parent = await prisma.parent.findUnique({
        where: { username },
        select: { id: true, username: true, name: true, surname: true, password: true },
    });

    if (parent && parent.password) {
        const isValid = await bcrypt.compare(password, parent.password);
        if (isValid) {
            return { id: parent.id, username: parent.username, name: parent.name, surname: parent.surname, role: "parent" };
        }
    }

    return null;
}

export async function findUserByUsername(username: string) {
    // Check in Admin table
    const admin = await prisma.admin.findUnique({
        where: { username },
        select: { id: true, username: true },
    });

    if (admin) {
        return { ...admin, role: "admin" };
    }

    // Check in Teacher table
    const teacher = await prisma.teacher.findUnique({
        where: { username },
        select: { id: true, username: true, name: true, surname: true },
    });

    if (teacher) {
        return { ...teacher, role: "teacher" };
    }

    // Check in Student table
    const student = await prisma.student.findUnique({
        where: { username },
        select: { id: true, username: true, name: true, surname: true },
    });

    if (student) {
        return { ...student, role: "student" };
    }

    // Check in Parent table
    const parent = await prisma.parent.findUnique({
        where: { username },
        select: { id: true, username: true, name: true, surname: true },
    });

    if (parent) {
        return { ...parent, role: "parent" };
    }

    return null;
}

export async function loginUser(username: string, password: string) {
    const user = await findUserByUsernameAndPassword(username, password);

    if (!user) {
        return { success: false, error: "Invalid username or password" };
    }

    return {
        success: true,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
            name: (user as any).name || "",
        },
    };
}

// Server-side function to get current user from cookies
export async function getCurrentUserFromCookie() {
    const headersList = headers();
    const cookieHeader = headersList.get("cookie") || "";

    // Parse the user cookie
    const userCookie = cookieHeader
        .split(";")
        .find((c) => c.trim().startsWith("user="));

    if (!userCookie) {
        return null;
    }

    try {
        const userString = userCookie.split("=")[1];
        const user = JSON.parse(decodeURIComponent(userString));
        return user;
    } catch (e) {
        console.error("Failed to parse user cookie:", e);
        return null;
    }
}