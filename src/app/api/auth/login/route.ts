import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { formatPhoneNumber } from "@/helpers/formatPhoneNumber";

export async function POST(req: Request) {
  const { phoneNumber, password, profileType } = await req.json();

  if (!phoneNumber || !password || !profileType) {
    return NextResponse.json(
      { message: "Телефон, пароль и тип аккаунта это обязательные поля" },
      { status: 404 }
    );
  }

  const profileTypeId = profileType === "student" ? 1 : 2;
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

  const user = await prisma.user.findUnique({
    where: {
      phoneNumber_profileTypeId: {
        phoneNumber: formattedPhoneNumber,
        profileTypeId,
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Пользователь не найден" },
      { status: 404 }
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json({ message: "Неверный пароль" }, { status: 401 });
  }

  return NextResponse.json(
    {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        profileType,
        name: user.name,
      },
    },
    { status: 200 }
  );
}
