import React from 'react'
import { Route, Redirect } from 'react-router-dom'

function PrivateRoute(props: any) {
  const { component: Component, loggedIn, ...rest } = props
  return (
    <Route
      {...rest}
      render={(props: any) =>
        loggedIn === true ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  )
}
export default PrivateRoute
