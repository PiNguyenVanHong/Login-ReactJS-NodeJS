import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import avatar from '../assets/profile.png'
import toast, {Toaster} from 'react-hot-toast'
import {useFormik} from 'formik';
import { passwordValidate, usernameValidate } from '../helper/validate';
import {useAuthStore} from '../store/store';

import styles from '../styles/Username.module.css'
import { generateOTP, verifyOTP } from '../helper/helper';

export default function Recovery() {

  const navigate = useNavigate();
  const {username} = useAuthStore((state) => state.auth);
  const [OTP, setOTP] = useState('');

  useEffect(() => {
    sendOTP(username);
  }, [username]);

  async function onSubmit(e) {
    e.preventDefault();

    try {
      let {status} = await verifyOTP({username, code: OTP});
      if(status === 201) {
        toast.success("Verify Successfully!!!");
        return navigate('/reset');
      }
  
      return toast.error("Won't OTP! Check email again!");
    } catch (error) {
      return toast.error("Won't OTP! Check email again!");
    }

  }

  // xử lý gửi lại OTP
  function sendOTP() {
    let sendPromise = generateOTP(username);

    toast.promise(sendPromise, {
      loading: 'Sending...',
      success: <b>OTP has been send to your email!</b>,
      error: <b>Couldn't send OTP!</b>
    });
  }

  return (
    <div className='container mx-auto'>
      <Toaster position='top-center' reverseOrder={false}></Toaster>
      <div className='flex justify-center items-center h-screen'>
        <div className={styles.glass}>
          <div className='title flex flex-col items-center'>
            <h4 className='text-5xl font-bold'>Recovery!</h4>
            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
              Enter OTP to recovery password.
            </span>
          </div>

          <form className='pt-20' onSubmit={onSubmit}>
            
            <div className='textbox flex flex-col items-center gap-6'>
              <div className='input text-center'>
                <span className='py-4 text-sm text-left text-gray-500'>
                  Enter 6 digit OTP sent to your email address.
                </span>
                <input onChange={(e) => setOTP(e.target.value)} className={styles.textbox} type='text' placeholder='OTP' />
              </div>
              <button className={styles.btn} type='submit'>Sign In</button>
            </div>
          </form>
          <div className='text-center py-4'>
              <span>Can't get OTP? <button onClick={sendOTP} className='text-red-500'>Resend</button></span>
            </div>
        </div>
      </div>
    </div>
  )
}
