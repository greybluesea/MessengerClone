"use client";

import getConversations from "@/app/actions/getConversations";
import useConversation from "@/app/hooks/useConversation";
import {
  ExtendedCoversationType,
  ExtendedMessageType,
  NewMessageViaPusher,
} from "@/types";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { MdOutlineGroupAdd } from "react-icons/md";
import ConversationBox from "./ConversationBox";
import GroupChatModal from "./GroupChatModal";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/pusher/pusher";
import { find } from "lodash";

type Props = {
  InitialConversations: ExtendedCoversationType[];
  users: User[];
};

const ConversationList = ({
  InitialConversations = [] as ExtendedCoversationType[],
  users,
}: Props) => {
  const [conversations, setConversations] = useState(InitialConversations);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const { isOpen, conversationId } = useConversation();
  const session = useSession();

  const currentUserEmail = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  useEffect(() => {
    if (!currentUserEmail) return;

    const handleNewConversation = (
      newConversation: ExtendedCoversationType
    ) => {
      setConversations((current) => {
        if (find(current, { id: newConversation!.id! })) return current;
        return [...current, newConversation];
      });
    };

    const handleNewMessage = (newMessage: NewMessageViaPusher) => {
      setConversations((current) =>
        current.map((currentConversation) => {
          if (currentConversation.id === newMessage.conversationId) {
            return {
              ...currentConversation,
              messages: [...currentConversation.messages, newMessage.message],
            };
          }

          return currentConversation;
        })
      );
    };

    pusherClient.subscribe(currentUserEmail);
    pusherClient.bind("conversation:new", handleNewConversation);
    pusherClient.bind("conversation:newMessage", handleNewMessage);

    return () => {
      pusherClient.unsubscribe(currentUserEmail);
      pusherClient.unbind("conversation:new", handleNewConversation);
      pusherClient.unbind("conversation:newMessage", handleNewMessage);
    };
  }, [currentUserEmail]);

  return (
    <aside
      className={clsx(
        `
        w-full
        fixed left-0 
        pb-20
        inset-y-0
        px-4
        lg:px-0
        lg:pb-0 lg:left-20 lg:w-60 overflow-y-auto lg:border-r border-slate-200  lg:bg-slate-300
      `,
        isOpen ? "hidden lg:block" : "block "
      )}
    >
      <GroupChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
      />
      <div className="p-5 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <p className="text-2xl font-bold ">Chats</p>
          <div
            className="p-2 rounded-md cursor-pointer hover:bg-slate-200 transition"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <MdOutlineGroupAdd size={32} />
          </div>
        </div>
        <div>
          {conversations.map((conversation) => (
            <ConversationBox
              key={conversation.id}
              conversation={conversation}
              selected={conversation.id === conversationId}
            ></ConversationBox>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ConversationList;
