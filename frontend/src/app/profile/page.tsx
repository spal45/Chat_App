"use client"
import { useAppData, user_service } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie";
import axios from 'axios';
import toast from 'react-hot-toast';
import Loading from '@/component/Loading';
import { ArrowLeft, Save, User, UserCircle } from 'lucide-react';

const ProfilePage = () => {
    const {user, isAuth, loading, setUser} = useAppData()
    const [isEdit, setIsEdit] = useState(false)
    const [name, setName] = useState<string | undefined>("")

    const router = useRouter()

    const editHandler = ()=>{
        setIsEdit(!isEdit);
        setName(user?.name);
    };

    const submitHandler = async(e:any)=>{
        e.preventDefault()
        const token = Cookies.get("token")
        try{
            const {data} = await axios.post(`${user_service}/api/v1/update/user`,{name},{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            Cookies.set("token", data.token, {
                expires: 15,
                secure: false,
                path: "/",
            })

            toast.success(data.message)
            setUser(data.user)
            setIsEdit(false)
        } catch(error: any) {
            toast.error(error.response.data.message)
        }
    }

    useEffect(()=>{
        if(!isAuth && !loading) {
            router.push("/login");
        }
    },[isAuth, router, loading]);

    if(loading) return <Loading />;

    return (
    <div className="min-h-screen bg-bg p-4">
        <div className="max-w-2xl mx-auto pt-8">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={()=> router.push("/chat")}
                    className="p-3 bg-panel hover:bg-card rounded-lg border border-line">
                        <ArrowLeft className="w-5 h-5 text-text-secondary"/>
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">
                        Profile Settings
                    </h1>
                    <p className="text-text-muted mt-1">
                        Manage your account information
                    </p>
                </div>
            </div>
            <div className="bg-panel rounded-lg border border-line shadow-lg">
                <div className="bg-card p-8 border-b border-line">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-card-hover flex items-center justify-center">
                                <UserCircle className="w-12 h-12 text-text-secondary"/>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-panel">

                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-text-primary mb-1">
                                {user?.name || "User"}
                            </h2>
                            <p className="text-text-secondary text-sm">Active now</p>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-3">Display Name</label>
                            {
                                isEdit ? <form onSubmit={submitHandler} className="space-y-4">
                                    <div className="relative">
                                        <input type="text" value={name} onChange={e=> setName(e.target.value)} className="w-full 
                                        px-4 py-3 bg-card border border-line rounded-lg text-text-primary placeholder-text-muted"/>
                                            <User className="absolute right-3 top-1/2 transform-translate-y-1/2 w-5 h-5 text-text-muted"/>
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover
                                        text-text-primary font-semibold rounded-lg">
                                            <Save className="w-4 h-4"/>Save Changes</button>
                                        <button type="button" onClick={editHandler} className="flex items-center gap-2 px-6 py-3 bg-card-hover hover:bg-card
                                        text-text-primary font-semibold rounded-lg">Cancel</button>
                                    </div>
                                </form>:<div className="flex items-center justify-between p-4 bg-card rounded-lg border border-line">
                                    <span className="text-text-primary font-medium text-lg">
                                        {user?.name || "Not Set"}
                                    </span>
                                    <button onClick={editHandler} className="flex items-center gap-2 px-6 py-3 bg-card-hover hover:bg-card
                                        text-text-primary font-semibold rounded-lg">Edit</button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ProfilePage;
