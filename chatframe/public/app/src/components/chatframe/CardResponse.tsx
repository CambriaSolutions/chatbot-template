import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Markdown from 'markdown-to-jsx'
import Link from '@material-ui/core/Link'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import styled from 'styled-components'
import { format } from 'date-fns'

// Date Format
import { sysTimeFormat } from './config/dateFormats'

const CardContainer = styled(Card)`
  && {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
    background: #fff;
    margin: 15px 16px 15px 16px;
    white-space: pre-line;
    scroll-margin: 15px;
  }
`

const CardImage = styled(CardMedia)`
  && {
    height: ${p => (p.image && p.image !== '' ? '200px' : '0px')};
    background-size: cover;
    background-position: center center;
  }
`

interface Props {
  inputValue: State['userInput'],
  data: {
    title: string,
    subtitle: string,
    imageUrl: string,
    buttons: any,
  },
  className: string
  key: string
}

class CardResponse extends PureComponent<Props> {
  render() {
    const { title, subtitle, imageUrl, buttons } = this.props.data
    return (
      <CardContainer className={this.props.className} key={this.props.key}>
        {imageUrl ? <CardImage image={encodeURI(imageUrl)} title='' /> : null}
        <CardContent>
          <Typography gutterBottom variant="h6">
            {title}
          </Typography>
          <Markdown
            options={{
              forceBlock: true,
              overrides: {
                h6: {
                  component: Typography,
                  props: {
                    variant: 'h6',
                  },
                },
                p: {
                  component: Typography,
                  props: {
                    variant: 'body1',
                  },
                },
                a: {
                  component: Link,
                },
              },
            }}
          >
            {subtitle}
          </Markdown>
        </CardContent>
        <CardActions>
          {buttons.map((b, index) => {
            const cardKey = `card-${index}${format(new Date(), sysTimeFormat)}`
            return (
              <Button
                href={b.postback}
                target="_blank"
                size="small"
                color="primary"
                key={cardKey}
              >
                {b.text}
              </Button>
            )
          })}
        </CardActions>
      </CardContainer>
    )
  }
}

const mapStateToProps = state => {
  return {
    inputValue: state.userInput,
  }
}

export default connect(mapStateToProps)(CardResponse)
