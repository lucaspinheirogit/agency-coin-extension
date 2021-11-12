import styled from 'styled-components'

export function Website(props: any) {
  const { website } = props

  return (
    <Container>
      <LogoContainer>
        <img width={24} height={24} src={website.faviconUrl} alt={website.name} />
        <Name>{website.name}</Name>
      </LogoContainer>
      <Time>{website.time} seconds</Time>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgb(252,178,83);
  padding: 0.5rem 0;
`

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`

const Name = styled.b`
  margin-left: 5px;
  text-transform: capitalize;
`

const Time = styled.i`
  font-size: 12px;
`
