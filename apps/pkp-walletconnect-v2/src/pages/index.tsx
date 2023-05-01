import SignIn from '@/components/SignIn'
import MyPKPs from '@/components/MyPKPs'
import useLitAuth from '@/hooks/useLitAuth'

export default function HomePage() {
  const { authenticated } = useLitAuth()

  if (!authenticated) {
    return <SignIn />
  }

  return <MyPKPs />
}
