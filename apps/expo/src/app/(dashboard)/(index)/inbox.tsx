import React, { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMailbox } from "@/components/mailboxContext";
import { api } from "@/utils/api";
import { ConversationList } from "../_components/conversationList";
import { Header } from "../_components/header";
import { TabBar } from "../_components/tabBar";
import { useFocusEffect } from "@react-navigation/native";

export default function InboxScreen() {
  const { selectedMailbox } = useMailbox();
  const [selectedTab, setSelectedTab] = useState<"conversations" | "mine" | "unassigned">("mine");

  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.mailbox.conversations.list.useInfiniteQuery(
      {
        mailboxSlug: selectedMailbox?.slug ?? "",
        category: selectedTab,
        sort: null,
        search: null,
        status: null,
        limit: 25,
      },
      {
        enabled: !!selectedMailbox?.slug,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const conversations = data?.pages.flatMap((page) => page.conversations) || [];

  const tabs: { id: typeof selectedTab; label: string }[] = [
    { id: "mine", label: "Mine" },
    { id: "unassigned", label: "Unassigned" },
    { id: "conversations", label: "All" },
  ];

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="py-3">
        <Header />
      </View>
      <View className="flex-row border-b border-border">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setSelectedTab(tab.id)}
            className={`flex-1 py-3 px-4 ${selectedTab === tab.id ? "border-b-2 border-foreground" : ""}`}
          >
            <Text
              className={`text-center ${selectedTab === tab.id ? "text-foreground font-medium" : "text-foreground"}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-1">
        <ConversationList
          conversations={conversations}
          onRefresh={refetch}
          isRefreshing={isRefetching}
          isLoading={isLoading}
          mailboxSlug={selectedMailbox?.slug ?? ""}
          onLoadMore={handleLoadMore}
          hasMore={!!hasNextPage}
          isLoadingMore={isFetchingNextPage}
        />
      </View>
      <TabBar />
    </SafeAreaView>
  );
}
