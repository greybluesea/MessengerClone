import React from "react";
import getCurrentUser from "./getCurrentUser";
import prisma from "@/prisma/prismadb";

const getConversations = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) return [];

  try {
    const conversations = await prisma?.conversation.findMany({
      orderBy: { lastMessageAt: "desc" },
      where: {
        userIds: {
          has: currentUser.id,
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            sender: true,
            seen: true,
          },
        },
      },
    });

    return conversations;
  } catch (err) {
    return [];
  }
};

export default getConversations;
