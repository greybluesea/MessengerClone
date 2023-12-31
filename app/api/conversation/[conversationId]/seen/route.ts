import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/prisma/prismadb";
import { pusherServer } from "@/pusher/pusher";

type Params = {
  conversationId?: string;
};

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const currentUser = await getCurrentUser();
    const { conversationId } = params;

    if (!currentUser || !currentUser.id || !currentUser.email)
      throw new NextResponse("Unauthorised", { status: 401 });

    if (!params?.conversationId)
      throw new NextResponse("Invalid request", { status: 400 });

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          include: {
            seen: true,
          },
        },
        users: true,
      },
    });

    if (!conversation) {
      throw new NextResponse("Invalid id", { status: 400 });
    }

    if (conversation.messages.length === 0)
      return NextResponse.json(conversation);

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return NextResponse.json(conversation);
    }

    const updatedLastMessageForSeenArray = await prisma.message.update({
      where: { id: lastMessage.id },
      include: {
        sender: true,
        seen: true,
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    await pusherServer.trigger(currentUser.email, "message:seen", {
      conversationId: conversationId,
      message: updatedLastMessageForSeenArray,
    });

    await pusherServer.trigger(
      conversationId!,
      "message:seen",
      updatedLastMessageForSeenArray
    );

    return NextResponse.json("Success", { status: 200 });
  } catch (err) {
    console.log(err, "ERROR_MESSAGES_SEEN");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
