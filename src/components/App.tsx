import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import toast from 'react-hot-toast'

import Logo from '../assets/logo.png'
import logoutImage from '../assets/logout.png'
import { Website } from './Website'

const BASE_URL = 'https://www.theagencycoin.com/api'
const STORAGE = chrome.storage.local

function getFromStorage(key: string): Promise<any> {
  return new Promise((resolve) => {
    STORAGE.get(key, (result) => (result[key] ? resolve(result[key]) : resolve(null)))
  })
}

function saveToStorage(key: string, value: any) {
  return new Promise((resolve) => {
    STORAGE.set({ [key]: value }, () => {
      resolve(true)
    })
  })
}

export function App() {
  const [data, setData] = useState<any>()
  const [wallet, setWallet] = useState<any>('')
  const [balance, setBalance] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getLocalStorageData()
  }, [])

  useEffect(() => {
    getBalance()
  }, [wallet])

  async function getLocalStorageData() {
    if (!STORAGE) return

    const currentDate = new Date().toISOString().substr(0, 10)

    const data = await getFromStorage(currentDate)
    const walletData = await getFromStorage('wallet')
    const wallet = walletData?.wallet

    if (data) setData(data)
    if (wallet) {
      setWallet(wallet)
      if (inputRef.current) inputRef.current.value = wallet
    }
  }

  async function getBalance() {
    if (!wallet) return

    toast.promise(fetch(`${BASE_URL}/balance/${wallet}`), {
      loading: 'Connecting...',
      success: onSuccess,
      error: 'Something went wrong, try again later!',
    })

    function onSuccess(response: any) {
      ;(async () => {
        const data = await response.json()
        setBalance(data?.balance)
      })()

      return 'Wallet successfully conected!'
    }
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()

    const wallet = inputRef?.current?.value || ''
    if (STORAGE) await saveToStorage('wallet', { wallet })
    setWallet(wallet)
  }

  async function handleLogout() {
    const wallet = ''

    if (inputRef.current) inputRef.current.value = wallet
    if (STORAGE) await saveToStorage('wallet', { wallet })
    setWallet(wallet)
    setBalance(0)
  }

  const websites =
    data &&
    Object.keys(data).map((key) => {
      const value = data[key]

      return {
        key,
        ...value,
      }
    })

  const websitesSortedByTimeDesc = websites?.sort((a: any, b: any) => b.time - a.time)

  return (
    <Container>
      <LogoImage src={Logo} alt="logo" />
      <LogoText>Agency coins</LogoText>
      <p style={{ margin: 0 }}>Balance: {balance}</p>

      <Form onSubmit={handleSubmit}>
        <Input ref={inputRef} disabled={!!wallet} required placeholder="wallet address" />
        <SubmitButton disabled={!!wallet} type="submit" value={wallet ? 'Wallet connected!' : 'Connect your wallet'} />
      </Form>

      <WebsitesContainer>
        {websitesSortedByTimeDesc?.map((website: any) => (
          <Website key={website.key} website={website} />
        ))}
      </WebsitesContainer>

      <Disclaimer>Copyright © Agency Enterprise Studio 2021</Disclaimer>

      {wallet && <LogoutImage onClick={handleLogout} src={logoutImage} alt="logout" title="disconnect wallet" />}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const LogoImage = styled.img`
  width: 128px;
  height: 128px;
`

const LogoText = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  background-color: white;
  background-image: linear-gradient(to right, rgb(252, 178, 83), rgb(251, 108, 99));
  background-size: 100%;
  -webkit-text-fill-color: transparent;
  margin: 0;
  background-repeat: repeat;
`

const Form = styled.form`
  margin: 1.5rem 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
`

const Input = styled.input`
  padding: 0.5rem 10px;
  border: 0;
  outline: 0;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`

const SubmitButton = styled.input`
  background-image: linear-gradient(to right, rgb(252, 178, 83), rgb(251, 108, 99));
  padding: 0.5rem 10px;
  border: 0;
  color: white;
  font-weight: 500;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  cursor: pointer;
  min-width: 150px;

  &:disabled {
    cursor: not-allowed;
  }
`

const WebsitesContainer = styled.div`
  width: 100%;
`

const Disclaimer = styled.p`
  margin: 0;
  margin-top: auto;
  font-size: 12px;
  font-weight: 300;
`

const LogoutImage = styled.img`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 16px;
  height: 16px;
  cursor: pointer;
`
