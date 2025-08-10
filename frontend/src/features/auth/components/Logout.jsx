import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAsync, selectLoggedInUser } from '../AuthSlice'
import { useNavigate } from 'react-router-dom'

export const Logout = () => {
  // Clear chat messages on logout
  localStorage.setItem('chatbot_messages', JSON.stringify([]));
  localStorage.setItem('chatbot_open', 'false'); // Also close chatbot
  
  const dispatch = useDispatch()
  const loggedInUser = useSelector(selectLoggedInUser)
  const navigate = useNavigate()

  // In your Logout component
  useEffect(() => {
    const performLogout = () => {
      // Clear chat history before logout
      localStorage.removeItem('chatbot_messages');
      localStorage.removeItem('chatbot_open');
      
      dispatch(logoutAsync());
      navigate("/login", { replace: true });
    };
    performLogout();
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/login")
    }
  }, [loggedInUser, navigate])

  return (
    <></>
  )
}