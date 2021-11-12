import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import toast from 'react-hot-toast'

import Logo from '../assets/logo.png'
import { Website } from './Website'

const BASE_URL = 'https://www.theagencycoin.com/api'

export function App() {
  const [data, setData] = useState<any>()
  const [wallet, setWallet] = useState('')
  const [balance, setBalance] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getLocalStorageData()
  }, [])

  function getLocalStorageData() {
    if (!chrome?.storage?.local) return

    const currentDate = new Date().toISOString().substr(0, 10)

    chrome.storage.local.get(currentDate, (result) => setData(result[currentDate]))
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    const wallet = inputRef?.current?.value || ''

    function onSuccess(response: any) {
      ;(async () => {
        const data = await response.json()
        setBalance(data?.balance)
      })()

      setWallet(wallet)

      return 'Wallet successfully conected!'
    }

    toast.promise(fetch(`${BASE_URL}/balance/${wallet}`), {
      loading: 'Connect...',
      success: onSuccess,
      error: 'Something went wrong, try again later!',
    })
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
      <p style={{ margin: 0 }}>Balance: {balance / 10e18}</p>

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
