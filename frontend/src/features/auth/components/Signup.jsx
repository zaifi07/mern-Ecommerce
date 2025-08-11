import { FormHelperText, Stack, TextField, Typography, Box, useTheme, useMediaQuery } from '@mui/material'
import React, { useEffect } from 'react'
import Lottie from 'lottie-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { ecommerceOutlookAnimation, shoppingBagAnimation } from '../../../assets'
import { useDispatch, useSelector } from 'react-redux'
import { LoadingButton } from '@mui/lab';
import { selectLoggedInUser, signupAsync, selectSignupStatus, selectSignupError, clearSignupError, resetSignupStatus } from '../AuthSlice'
import { toast } from 'react-toastify'
import { MotionConfig, motion } from 'framer-motion'

export const Signup = () => {
  const dispatch = useDispatch()
  const status = useSelector(selectSignupStatus)
  const error = useSelector(selectSignupError)
  const loggedInUser = useSelector(selectLoggedInUser)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const theme = useTheme()
  const is900 = useMediaQuery(theme.breakpoints.down(900))
  const is480 = useMediaQuery(theme.breakpoints.down(480))
  const is320 = useMediaQuery(theme.breakpoints.down(320))

  // handles user redirection
  useEffect(() => {
    if (loggedInUser && !loggedInUser?.isVerified) {
      navigate("/verify-otp")
    }
    else if (loggedInUser) {
      navigate("/")
    }
  }, [loggedInUser])


  // handles signup error and toast them
  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])


  useEffect(() => {
    if (status === 'fullfilled') {
      toast.success("Welcome! Verify your email to start shopping on mern-ecommerce.")
      reset()
    }
    return () => {
      dispatch(clearSignupError())
      dispatch(resetSignupStatus())
    }
  }, [status])

  // this function handles signup and dispatches the signup action with credentails that api requires
  const handleSignup = (data) => {
    const cred = { ...data }
    delete cred.confirmPassword
    dispatch(signupAsync(cred))
  }

  return (
    <Stack
      width={'100vw'}
      height={'100vh'}
      flexDirection={'row'}
      sx={{
        overflowY: "hidden",
        overflowX: "hidden",
        ...(is900 && {
          overflowY: "auto",
          overflowX: "hidden"
        })
      }}
    >

      {
        !is900 &&

        <Stack bgcolor={'black'} flex={1} justifyContent={'center'} >
          <Lottie animationData={ecommerceOutlookAnimation} />
        </Stack>

      }

      <Stack
        flex={1}
        justifyContent={'center'}
        alignItems={'center'}
        sx={{
          ...(is900 && {
            px: is320 ? 1 : 2,
            py: 4,
            minHeight: '100vh',
            width: '100%',
            maxWidth: '100vw'
          })
        }}
      >

        <Stack
          flexDirection={'row'}
          justifyContent={'center'}
          alignItems={'center'}
          sx={{
            ...(is900 && {
              mb: 2
            })
          }}
        >
          <Stack rowGap={'.4rem'}>
            <Typography
              variant={is480 ? 'h3' : 'h2'}
              sx={{
                wordBreak: "break-word",
                textAlign: 'center'
              }}
              fontWeight={600}
            >
              Mern Shop
            </Typography>
            <Typography
              alignSelf={'flex-end'}
              color={'GrayText'}
              variant='body2'
              sx={{
                ...(is480 && {
                  textAlign: 'center',
                  alignSelf: 'center'
                })
              }}
            >
              - Shop Anything
            </Typography>
          </Stack>

        </Stack>

        <Stack
          mt={is900 ? 2 : 4}
          spacing={is480 ? 1.5 : 2}
          width={is320 ? "90vw" : is480 ? "85vw" : '28rem'}
          sx={{
            maxWidth: is320 ? '280px' : is480 ? '300px' : '28rem'
          }}
          component={'form'}
          noValidate
          onSubmit={handleSubmit(handleSignup)}
        >

          <MotionConfig whileHover={{ y: -5 }}>

            <motion.div>
              <TextField
                fullWidth
                {...register("name", { required: "Username is required" })}
                placeholder='Username'
                size={is480 ? 'small' : 'medium'}
              />
              {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
            </motion.div>

            <motion.div>
              <TextField
                fullWidth
                {...register("email", { required: "Email is required", pattern: { value: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, message: "Enter a valid email" } })}
                placeholder='Email'
                size={is480 ? 'small' : 'medium'}
              />
              {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
            </motion.div>

            <motion.div>
              <TextField
                type='password'
                fullWidth
                {...register("password", { required: "Password is required", pattern: { value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm, message: `at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number, Can contain special characters` } })}
                placeholder='Password'
                size={is480 ? 'small' : 'medium'}
              />
              {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
            </motion.div>

            <motion.div>
              <TextField
                type='password'
                fullWidth
                {...register("confirmPassword", { required: "Confirm Password is required", validate: (value, fromValues) => value === fromValues.password || "Passwords doesn't match" })}
                placeholder='Confirm Password'
                size={is480 ? 'small' : 'medium'}
              />
              {errors.confirmPassword && <FormHelperText error>{errors.confirmPassword.message}</FormHelperText>}
            </motion.div>

          </MotionConfig>

          <motion.div whileHover={{ scale: 1.020 }} whileTap={{ scale: 1 }}>
            <LoadingButton
              sx={{
                height: is480 ? '2.2rem' : '2.5rem',
                mt: is480 ? 1 : 0
              }}
              fullWidth
              loading={status === 'pending'}
              type='submit'
              variant='contained'
              size={is480 ? 'medium' : 'large'}
            >
              Signup
            </LoadingButton>
          </motion.div>

          <Stack
            flexDirection={is480 ? 'column' : 'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
            spacing={is480 ? 1 : 0}
            sx={{
              ...(is480 && {
                mt: 2
              })
            }}
          >
            <MotionConfig whileHover={{ x: 2 }} whileTap={{ scale: 1.050 }}>
              <motion.div>
                <Typography
                  mr={is480 ? 0 : '1.5rem'}
                  sx={{
                    textDecoration: "none",
                    color: "text.primary",
                    ...(is480 && {
                      textAlign: 'center',
                      fontSize: '0.875rem'
                    })
                  }}
                  to={'/forgot-password'}
                  component={Link}
                >
                  Forgot password
                </Typography>
              </motion.div>

              <motion.div>
                <Typography
                  sx={{
                    textDecoration: "none",
                    color: "text.primary",
                    ...(is480 && {
                      textAlign: 'center',
                      fontSize: '0.875rem'
                    })
                  }}
                  to={'/login'}
                  component={Link}
                >
                  Already a member? <span style={{ color: theme.palette.primary.dark }}>Login</span>
                </Typography>
              </motion.div>
            </MotionConfig>
          </Stack>

        </Stack>


      </Stack>
    </Stack>
  )
}