"use client"
import Loading from '@/component/Loading'
import { useAppData, user_service } from '@/context/AppContext'
import axios from 'axios'
import { ArrowRight, Loader2, Mail } from 'lucide-react'
import { redirect, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

const page = () => {
    const [email, setEmail] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter();

    const {isAuth, loading: userLoading} = useAppData()

    const handleSubmit = async (e:React.SubmitEvent<HTMLElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);

        try{
            const {data} = await axios.post(`${user_service}/api/v1/login`,{
                email,
            })
            toast.success(data.message)
            router.push(`/verify?email=${email}`)
        }catch(error:any){
            toast.error(error.response.data.message)
        }finally{
            setLoading(false)
        }
    }

    if(userLoading) return <Loading/>
    if(isAuth) return redirect('/chat')
    return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-panel border border-line rounded-lg p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-20 h-20 bg-accent rounded-lg flex items-center justify-center mb-6">
                            <Mail size={40} className="text-text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold text-text-primary mb-3">
                            Welcome To ChatApp
                        </h1>
                        <p className="text-text-secondary text-lg">
                            Enter your email to continue your journey
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                            <input  type="email" 
                                    id="email" 
                                    className="w-full px-4 py-4 bg-card border border-line rounded-lg text-text-primary placeholder-text-muted" 
                                    placeholder="Enter Your Email Address"
                                    value={email}
                                    onChange={e=>setEmail(e.target.value)} 
                                    required 
                                    />
                        </div>
                        <button type="submit" 
                                className="w-full bg-accent text-text-primary py-4 px-6 rounded-lg font-semibold hover:bg-accent-hover 
                                disabled:opac50 
                                disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5" />
                                        Sending Otp to your mail...
                                    </div>
                                ):(
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Send Verification Code</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default page
