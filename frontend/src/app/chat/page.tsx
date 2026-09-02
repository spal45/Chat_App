"use client"
import Loading from '@/component/Loading';
import { useAppData } from '@/context/AppContext'
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'

const page = () => {
  const {loading, isAuth} = useAppData();
  const router = useRouter();

  useEffect(()=>{
    if(!isAuth && !loading){
      router.push("/login")
    }
  },[isAuth, router, loading]);

  if(loading) return <Loading/>
  return (
    <div>
      chatapp
    </div>
  )
}

export default page
