import { Fragment } from 'react'
import PageHeader from './PageHeader'
import { Container, Loading } from '@nextui-org/react'

export default function LoadingView() {
  return (
    <Fragment>
      <Container
        display="flex"
        direction="column"
        justify="center"
        alignItems="center"
        css={{ height: '100%' }}
      >
        <Loading />
      </Container>
    </Fragment>
  )
}
