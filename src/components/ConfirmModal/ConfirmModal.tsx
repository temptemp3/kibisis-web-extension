import {
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React, { createRef, FC, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

// Components
import Button from '../Button';

// Constants
import { DEFAULT_GAP } from '../../constants';

// Hooks
import useDefaultTextColor from '../../hooks/useDefaultTextColor';

// Theme
import { theme } from '../../theme';

interface IProps {
  description: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}

const ConfirmModal: FC<IProps> = ({
  description,
  isOpen,
  onConfirm,
  onCancel,
  title,
}: IProps) => {
  const { t } = useTranslation();
  const defaultTextColor: string = useDefaultTextColor();
  const initialRef: RefObject<HTMLButtonElement> | undefined = createRef();
  const handleCancelClick = () => onCancel();
  const handleConfirmClick = () => onConfirm();

  return (
    <Modal
      initialFocusRef={initialRef}
      isOpen={isOpen}
      motionPreset="slideInBottom"
      onClose={onCancel}
      size="full"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent
        alignSelf="flex-end"
        backgroundColor="var(--chakra-colors-chakra-body-bg)"
        borderTopRadius={theme.radii['3xl']}
        borderBottomRadius={0}
        minH="65dvh"
      >
        <ModalHeader justifyContent="center" px={DEFAULT_GAP}>
          <Heading color={defaultTextColor} size="md" textAlign="center">
            {title}
          </Heading>
        </ModalHeader>
        <ModalBody>
          <Text color={defaultTextColor} fontSize="md" textAlign="left">
            {description}
          </Text>
        </ModalBody>
        <ModalFooter p={DEFAULT_GAP}>
          <HStack spacing={4} w="full">
            <Button
              colorScheme="primary"
              onClick={handleCancelClick}
              ref={initialRef}
              size="lg"
              variant="outline"
              w="full"
            >
              {t<string>('buttons.cancel')}
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleConfirmClick}
              size="lg"
              variant="solid"
              w="full"
            >
              {t<string>('buttons.confirm')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;