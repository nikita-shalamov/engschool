import { getSession } from "@/app/lib/session";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tutorId = searchParams.get("tutorId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!tutorId || !startDate || !endDate) {
    return NextResponse.json(
      { message: "Недостаточно данных для выполнения запроса." },
      { status: 400 }
    );
  }

  const session = await getSession();
  if (!session || Number(session.userId) !== Number(tutorId)) {
    return NextResponse.json(
      { message: "Вы не авторизованы!" },
      { status: 401 }
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json(
      { message: "Неверный формат дат." },
      { status: 400 }
    );
  }

  try {
    const teacherLessons = await prisma.lessons.findMany({
      where: {
        tutorId: Number(tutorId),
        lessonDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const lessons = await Promise.all(
      teacherLessons.map(async (lesson) => {
        const linkData = await prisma.tutorStudent.findFirst({
          where: {
            tutorId: lesson.tutorId,
            studentId: lesson.studentId,
          },
          select: {
            lessonLink: true,
          },
        });

        return {
          ...lesson,
          lessonLink: linkData?.lessonLink || null,
        };
      })
    );

    return NextResponse.json(
      { lessons, message: "Уроки успешно найдены!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Ошибка при выполнении запроса." },
      { status: 500 }
    );
  }
}
