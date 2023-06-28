import React from "react";

type Props = {};

const getMessages = async (conversationId: string) => {
  try {
    const messages = await prisma?.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: true,
        seen: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return messages;
  } catch (err) {
    return null;
  }
};

export default getMessages;
