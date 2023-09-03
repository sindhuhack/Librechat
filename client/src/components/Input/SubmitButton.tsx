import React, { useState, useEffect } from 'react';
import { StopGeneratingIcon } from '~/components';
import { Settings } from 'lucide-react';
import { SetKeyDialog } from './SetKeyDialog';
import type { TOnClick } from '~/common';
import { useUserKey, useLocalize } from '~/hooks';

export default function SubmitButton({
  endpoint,
  submitMessage,
  handleStopGenerating,
  disabled,
  isSubmitting,
  endpointsConfig,
}) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { checkExpiry } = useUserKey(endpoint);

  const isKeyProvided = endpointsConfig?.[endpoint]?.userProvide ? checkExpiry() : true;
  const endpointsToHideSetKeys = new Set(['openAI', 'azureOpenAI', 'bingAI']);
  const localize = useLocalize();

  const clickHandler: TOnClick = (e) => {
    e.preventDefault();
    submitMessage();
  };

  const setKey = () => {
    setDialogOpen(true);
  };

  if (isSubmitting) {
    return (
      <button
        onClick={handleStopGenerating}
        type="button"
        className="group absolute bottom-0 right-0 z-[101] flex h-[100%] w-[50px] items-center justify-center bg-transparent p-1 text-gray-500"
      >
        <div className="m-1 mr-0 rounded-md p-2 pb-[10px] pt-[10px] group-hover:bg-gray-100 group-disabled:hover:bg-transparent dark:group-hover:bg-gray-900 dark:group-hover:text-gray-400 dark:group-disabled:hover:bg-transparent">
          <StopGeneratingIcon />
        </div>
      </button>
    );
  } else if (!isKeyProvided && !endpointsToHideSetKeys.has(endpoint)) {
    return (
      <>
        <button
          onClick={setKey}
          type="button"
          className="group absolute bottom-0 right-0 z-[101] flex h-[100%] w-auto items-center justify-center bg-transparent pr-1 text-gray-500"
        >
          <div className="flex items-center justify-center rounded-md text-xs group-hover:bg-gray-100 group-disabled:hover:bg-transparent dark:group-hover:bg-gray-900 dark:group-hover:text-gray-400 dark:group-disabled:hover:bg-transparent">
            <div className="m-0 mr-0 flex items-center justify-center rounded-md p-2 sm:p-2">
              <Settings className="mr-1 inline-block h-auto w-[18px]" />
              {localize('com_endpoint_config_token_name_placeholder')}
            </div>
          </div>
        </button>
        <SetKeyDialog open={isDialogOpen} onOpenChange={setDialogOpen} endpoint={endpoint} />
      </>
    );
  } else {
    return (
      <button
        onClick={clickHandler}
        disabled={disabled}
        className="group absolute bottom-0 right-0 z-[101] flex h-[100%] w-[50px] items-center justify-center bg-transparent p-1 text-gray-500"
      >
        <div className="m-1 mr-0 rounded-md pb-[9px] pl-[9.5px] pr-[7px] pt-[11px] group-hover:bg-gray-100 group-disabled:hover:bg-transparent dark:group-hover:bg-gray-900 dark:group-hover:text-gray-400 dark:group-disabled:hover:bg-transparent">
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1 h-4 w-4 "
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
      </button>
    );
  }
}

{
  /* <div class="text-2xl"><span class="">·</span><span class="">·</span><span class="invisible">·</span></div> */
}
