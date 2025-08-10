import { Box, FormHelperText, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect } from 'react'
import Lottie from 'lottie-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { ecommerceOutlookAnimation, shoppingBagAnimation } from '../../../assets'
import { useDispatch, useSelector } from 'react-redux'
import { LoadingButton } from '@mui/lab';
import { selectLoggedInUser, loginAsync, selectLoginStatus, selectLoginError, clearLoginError, resetLoginStatus } from '../AuthSlice'
import { toast } from 'react-toastify'
import { MotionConfig, motion } from 'framer-motion'

export const Login = () => {
  const dispatch = useDispatch()
  const status = useSelector(selectLoginStatus)
  const error = useSelector(selectLoginError)
  const loggedInUser = useSelector(selectLoggedInUser)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const theme = useTheme()
  const is900 = useMediaQuery(theme.breakpoints.down(900))
  const is480 = useMediaQuery(theme.breakpoints.down(480))

  // handles user redirection
  useEffect(() => {
    if (loggedInUser && loggedInUser?.isVerified) {
      navigate("/")
    }
    else if (loggedInUser && !loggedInUser?.isVerified) {
      navigate("/verify-otp")
    }
  }, [loggedInUser])

  // handles login error and toast them
  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])

  // handles login status and dispatches reset actions to relevant states in cleanup
  useEffect(() => {
    if (status === 'fullfilled' && loggedInUser?.isVerified === true) {
      toast.success(`Login successful`)
      reset()
    }
    return () => {
      dispatch(clearLoginError())
      dispatch(resetLoginStatus())
    }
  }, [status])

  const handleLogin = (data) => {
    const cred = { ...data }
    delete cred.confirmPassword
    dispatch(loginAsync(cred))
  }

  return (
    <Stack
      width={'100vw'}
      height={'100vh'}
      flexDirection={'row'}
      sx={{
        overflowY: "hidden",
        backgroundColor: theme.palette.background.default // Using theme background
      }}
    >

      {
        !is900 &&

        <Stack
          bgcolor={theme.palette.background.seagreen}
          flex={1}
          justifyContent={'center'}
        >
          <Lottie animationData={ecommerceOutlookAnimation} />
        </Stack>
      }

      <Stack
        flex={1}
        justifyContent={'center'}
        alignItems={'center'}
        sx={{
          backgroundColor: theme.palette.background.paper // Using theme paper background
        }}
      >

        <Stack flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>

          <Stack rowGap={'.4rem'}>
            <Typography
              variant='h2'
              sx={{
                wordBreak: "break-word",
                color: theme.palette.text.primary // Using theme text color
              }}
              fontWeight={600}
            >
              Mern Shop
            </Typography>
            <Typography
              alignSelf={'flex-end'}
              color={theme.palette.text.secondary} // Using theme secondary text
              variant='body2'
            >
              - Shop Anything
            </Typography>
          </Stack>

        </Stack>

        <Stack
          mt={4}
          spacing={2}
          width={is480 ? "95vw" : '28rem'}
          component={'form'}
          noValidate
          onSubmit={handleSubmit(handleLogin)}
        >

          <motion.div whileHover={{ y: -5 }}>
            <TextField
              fullWidth
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
                  message: "Enter a valid email"
                }
              })}
              placeholder='Email'
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                },
                '& .MuiInputBase-input::placeholder': {
                  color: theme.palette.text.secondary,
                  opacity: 1,
                },
              }}
            />
            {errors.email && <FormHelperText sx={{ mt: 1 }} error>{errors.email.message}</FormHelperText>}
          </motion.div>


          <motion.div whileHover={{ y: -5 }}>
            <TextField
              type='password'
              fullWidth
              {...register("password", { required: "Password is required" })}
              placeholder='Password'
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                },
                '& .MuiInputBase-input::placeholder': {
                  color: theme.palette.text.secondary,
                  opacity: 1,
                },
              }}
            />
            {errors.password && <FormHelperText sx={{ mt: 1 }} error>{errors.password.message}</FormHelperText>}
          </motion.div>

          <motion.div whileHover={{ scale: 1.020 }} whileTap={{ scale: 1 }}>
            <LoadingButton
              fullWidth
              sx={{ height: '2.5rem' }}
              loading={status === 'pending'}
              type='submit'
              variant='contained'
            >
              Login
            </LoadingButton>
          </motion.div>

          <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap-reverse'}>

            <MotionConfig whileHover={{ x: 2 }} whileTap={{ scale: 1.050 }}>
              <motion.div>
                <Typography
                  mr={'1.5rem'}
                  sx={{
                    textDecoration: "none",
                    color: theme.palette.text.primary // Using theme text color
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
                    color: theme.palette.text.primary // Using theme text color
                  }}
                  to={'/signup'}
                  component={Link}
                >
                  Don't have an account? <span style={{ color: theme.palette.primary.main }}>Register</span>
                </Typography>
              </motion.div>
            </MotionConfig>

          </Stack>

        </Stack>
      </Stack>
    </Stack>
  )
}