import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, PageWrapper, PageContentWrapper, PageParagraph } from '../components';
import { extractUserData, getUserFromRedirect, handleSignIn, saveUserInFirestore } from '../api';

import queryString from 'query-string';

function SignUpBeforeRedirect() {
  return (
    <PageContentWrapper>
      <p>היי! כדי לערוך עמוד הפגנה ולקחת חלק בפעילות האתר יש להתחבר באמצעות פייסבוק. </p>
      <div></div>

      <Button onClick={() => handleSignIn()}>התחברות דרך פייסבוק</Button>
    </PageContentWrapper>
  );
}

const stages = {
  UNKNOWN: 'unkonwn',
  BEFORE_FACEBOOK_AUTH: 'beforeFacebookAuth',
  AFTER_FACEBOOK_AUTH: 'afterFacebookAuth',
};

export default function SignUp(props) {
  const [stage, setStage] = useState(stages.UNKNOWN);
  const history = useHistory();

  useEffect(() => {
    getUserFromRedirect()
      .then((result) => {
        if (!result) {
          setStage(stages.BEFORE_FACEBOOK_AUTH);
          return;
        }

        const userData = extractUserData(result);
        setStage(stages.AFTER_FACEBOOK_AUTH);

        saveUserInFirestore(userData).then(() => {
          const { returnUrl } = queryString.parse(window.location.search);

          if (returnUrl) {
            history.push(returnUrl);
          } else {
            // Redirect to homepage.
            setTimeout(() => {
              history.push('/');
            }, 2020);
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }, [history]);

  if (stage === stages.UNKNOWN) {
    return (
      <PageWrapper>
        <p>רק כמה שניות...</p>
        <img src="/icons/loading-spinner.svg" alt="" />
      </PageWrapper>
    );
  }

  if (stage === stages.BEFORE_FACEBOOK_AUTH) {
    return (
      <PageWrapper>
        <SignUpBeforeRedirect />
      </PageWrapper>
    );
  }

  if (stage === stages.AFTER_FACEBOOK_AUTH) {
    return (
      <PageWrapper>
        <PageContentWrapper>
          <PageParagraph>התחברת בהצלחה.</PageParagraph>
        </PageContentWrapper>
      </PageWrapper>
    );
  }
}
