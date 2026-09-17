"use client"

import Loading from "@/component/Loading";
import { useAppData } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const page = () => {
  const { isAuth, loading } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(isAuth ? "/chat" : "/login");
  }, [isAuth, loading, router]);

  return <Loading />;
};

export default page;
