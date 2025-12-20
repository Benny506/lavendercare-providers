import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import ErrorMsg1 from "./ErrorMsg1";
import { createOrUpdateOtp, validateOtp } from "@/database/dbInit";
import { useNavigate } from "react-router-dom";
import { sendEmail } from "@/database/email/email";

const initialSeconds = 59

const OtpInput = ({ length = 6, onValidated, email = '', fromForgotPassword, goBackPath }) => {
  const dispatch = useDispatch()

  const navigate = useNavigate()

  const [values, setValues] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);
  const [apiReqs, setApiReqs] = useState({ isLoading: false, errorMsg: null, data: null })
  const [timer, setTimer] = useState(initialSeconds)

  useEffect(() => {
    if (!onValidated || !email) return

    setApiReqs({ isLoading: true, errorMsg: null, data: { type: 'sendOtp', requestInfo: {} } })
    sendOtp({})

    let _timer = initialSeconds
    const timerInterval = setInterval(() => {
      _timer = _timer - 1

      if (_timer < 0) {
        clearInterval(timerInterval)
        return;
      }

      setTimer(_timer)
    }, 1000)

    return () => {
      clearInterval(timerInterval)
    }
  }, [])


  useEffect(() => {
    const { isLoading, data } = apiReqs

    if (isLoading) dispatch(appLoadStart());
    else dispatch(appLoadStop());

    if (isLoading && data) {
      const { type, requestInfo } = data

      if (type == 'sendOtp') {
        sendOtp({ requestInfo })
      }

      if (type == 'confirmOtp') {
        confirmOtp({ requestInfo })
      }
    }

  }, [apiReqs])


  const resendCode = () => {
    setApiReqs({
      isLoading: true,
      errorMsg: null,
      data: {
        type: 'sendOtp',
        requestInfo: {
          restartTimer: true
        }
      }
    })
  }

  const restartTimer = () => {
    let _timer = initialSeconds
    const timerInterval = setInterval(() => {
      _timer = _timer - 1

      if (_timer < 0) {
        clearInterval(timerInterval)
        return;
      }

      setTimer(_timer)
    }, 1000)
  }

  const sendOtp = async ({ requestInfo }) => {
    if (!email) return;

    try {

      const { userAlreadyExists, token, error } = await createOrUpdateOtp({ email, requiresAuth: fromForgotPassword ? true : false })

      if (userAlreadyExists && !fromForgotPassword) {
        setApiReqs({ isLoading: false, errorMsg: null, type: 'sendOtp' })
        toast.info("Email already used by another user")
        navigate(goBackPath || -1)

        return
      }

      if (error) {
        console.log(error)
        throw new Error()
      }

      if (token && token?.otp) {
        const { sent } = await sendEmail ({
          subject: 'Email verification',
          to_email: email,
          data: {
            code: token?.otp
          },
          template_id: '3vz9dle7wpn4kj50'
        })

        if (!sent) throw new Error()

        setApiReqs({ isLoading: false, errorMsg: null, type: null })
        // alert("For now, enter the token: " + token.otp)
        toast.success("Verification token sent to mail")

        if (requestInfo?.restartTimer) {
          restartTimer()
        }

        return
      }

      throw new Error()

    } catch (error) {
      console.log(error)
      sendOtpError({ errorMsg: 'Something went wrong! Try again later' })
    }
  }
  const sendOtpError = ({ errorMsg }) => {
    setApiReqs({ isLoading: false, errorMsg, type: 'sendOtp' })
    toast.error(errorMsg)

    return
  }

  const confirmOtp = async ({ requestInfo }) => {
    try {

      const { otp, email } = requestInfo

      if (!otp || !email) throw new Error();

      const isValid = await validateOtp({ email, otp })

      if (!isValid) {
        const errorMsg = 'Invalid or expired OTP'
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return;
      }

      setApiReqs({ isLoading: false, errorMsg: null, data: null })
      toast.success("OTP verified")

      return onValidated && onValidated()

    } catch (error) {
      console.log(error)
      return confirmOtpFailure({ errorMsg: 'Something went wrong! Try again' })
    }
  }
  const confirmOtpFailure = ({ errorMsg }) => {
    setApiReqs({ isLoading: false, errorMsg: null, data: null })
    toast.error(errorMsg)

    return
  }

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // only digits

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newValues.every((val) => val !== "")) {
      const otp = newValues.join("")

      setApiReqs({
        isLoading: true,
        errorMsg: null,
        data: {
          type: 'confirmOtp',
          requestInfo: {
            otp, email
          }
        }
      })
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  if (!onValidated || !email) return <></>

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {
        apiReqs.errorMsg
        &&
        <ErrorMsg1 errorMsg={apiReqs.errorMsg} position={'center'} />
      }
      <div className="flex justify-center gap-3">
        {values.map((val, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={val}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputsRef.current[index] = el)}
            className="w-12 h-12 text-center border border-grey-300 rounded-lg text-lg bg-grey-50"
          />
        ))}
      </div>
      {/* Timer */}
      <p className="text-sm text-grey-600">
        {
          timer > 0
            ?
            <span className="font-bold">00:{timer}</span>
            :
            <span onClick={resendCode} className="font-bold underline cursor-pointer">Resend</span>
        }
      </p>
    </div>
  );
};

export default OtpInput;
