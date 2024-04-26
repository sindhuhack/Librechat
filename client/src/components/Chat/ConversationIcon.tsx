import React from 'react';
import type { TPreset } from 'librechat-data-provider';
import type { IconMapProps } from '~/common';
import { icons } from '~/components/Chat/Menus/Endpoints/Icons';

interface ConversationIconProps {
  preset: TPreset;
  endpointIconURL?: string;
  assistantName?: string;
  avatar?: string;
}

const ConversationIcon: React.FC<ConversationIconProps> = ({
  preset,
  endpointIconURL,
  assistantName,
  avatar,
}) => {
  const { iconURL = '' } = preset;
  let Icon: (
    props: IconMapProps & {
      context?: string;
      iconURL?: string;
    },
  ) => React.JSX.Element;

  if (!iconURL?.includes('http')) {
    Icon = icons[iconURL] ?? icons.unknown;
  } else {
    Icon = () => (
      <div
        className="icon-xl relative flex h-full overflow-hidden rounded-full"
        style={{ width: '100%', height: '100%' }}
      >
        <img
          src={iconURL}
          alt={preset.chatGptLabel ?? preset.modelLabel ?? ''}
          style={{ width: '100%', height: '100%' }}
          className="object-cover"
        />
      </div>
    );

    return <Icon />;
  }

  return (
    <div className="shadow-stroke relative flex h-full items-center justify-center rounded-full bg-white text-black">
      <Icon
        size={41}
        context="landing"
        className="h-2/3 w-2/3"
        iconURL={endpointIconURL}
        assistantName={assistantName}
        avatar={avatar}
      />
    </div>
  );
};

export default ConversationIcon;
