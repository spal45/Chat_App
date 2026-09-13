import Loading from "@/component/Loading"
import VerifyOtp from "@/component/VerifyOtp"
import { Suspense } from "react"

const verifyPage = () => {    
  return (
    <Suspense fallback={<Loading/>}>
        <VerifyOtp/>
    </Suspense>
  )
}

export default verifyPage
