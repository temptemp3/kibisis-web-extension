import {
  Avatar,
  Box,
  Code,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
  SkeletonCircle,
  Text,
  VStack,
} from '@chakra-ui/react';
import { generateAccount } from 'algosdk';
import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

// components
import AccountSelect from '@extension/components/AccountSelect';
import AccountItem from '@extension/components/AccountItem';
import Button from '@extension/components/Button';
import PasswordInput from '@extension/components/PasswordInput';
import SignBytesJwtContent from './SignBytesJwtContent';

// constants
import { DEFAULT_GAP } from '@extension/constants';

// enums
import { ErrorCodeEnum } from '@extension/enums';

// errors
import {
  SerializableOperationCanceledError,
  SerializableUnknownError,
} from '@common/errors';

// features
import { setError } from '@extension/features/system';
import { sendSignBytesResponse } from '@extension/features/messages';

// hooks
import useDefaultTextColor from '@extension/hooks/useDefaultTextColor';
import useSignBytes from '@extension/hooks/useSignBytes';
import useSubTextColor from '@extension/hooks/useSubTextColor';
import useTextBackgroundColor from '@extension/hooks/useTextBackgroundColor';

// selectors
import {
  useSelectAccounts,
  useSelectFetchingAccounts,
  useSelectSignBytesRequest,
} from '@extension/selectors';

// servcies
import { AccountService } from '@extension/services';

// theme
import { theme } from '@extension/theme';

// types
import {
  IAccount,
  IAppThunkDispatch,
  IDecodedJwt,
  ISignBytesRequest,
} from '@extension/types';

// utils
import { decodeJwt, ellipseAddress } from '@extension/utils';

interface IProps {
  onClose: () => void;
}

const SignBytesModal: FC<IProps> = ({ onClose }: IProps) => {
  const { t } = useTranslation();
  const dispatch: IAppThunkDispatch = useDispatch<IAppThunkDispatch>();
  // selectors
  const accounts: IAccount[] = useSelectAccounts();
  const signBytesRequest: ISignBytesRequest | null =
    useSelectSignBytesRequest();
  const fetching: boolean = useSelectFetchingAccounts();
  // hooks
  const defaultTextColor: string = useDefaultTextColor();
  const { encodedSignedBytes, error, signBytes } = useSignBytes();
  const subTextColor: string = useSubTextColor();
  const textBackgroundColor: string = useTextBackgroundColor();
  // state
  const [decodedJwt, setDecodedJwt] = useState<IDecodedJwt | null>(null);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [selectedSigner, setSelectedSigner] = useState<IAccount | null>(null);
  const handleAccountSelect = (account: IAccount) => setSelectedSigner(account);
  const handleCancelClick = () => {
    if (signBytesRequest) {
      dispatch(
        sendSignBytesResponse({
          encodedSignature: null,
          error: new SerializableOperationCanceledError(
            `user dismissed sign bytes modal`
          ),
          requestEventId: signBytesRequest.requestEventId,
          tabId: signBytesRequest.tabId,
        })
      );
    }

    handleClose();
  };
  const handleClose = () => {
    setPassword('');
    setPasswordError(null);
    onClose();
  };
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPasswordError(null);
    setPassword(event.target.value);
  };
  const handleSignClick = async () => {
    if (!signBytesRequest || !selectedSigner) {
      return;
    }

    await signBytes({
      encodedData: signBytesRequest.encodedData,
      password,
      signer: AccountService.convertPublicKeyToAlgorandAddress(
        selectedSigner.publicKey
      ),
    });
  };
  const renderContent = () => {
    if (fetching || !signBytesRequest || !selectedSigner) {
      return (
        <VStack spacing={4} w="full">
          <HStack py={4} spacing={4} w="full">
            <SkeletonCircle size="12" />
            <Skeleton flexGrow={1}>
              <Text color={defaultTextColor} fontSize="md" textAlign="center">
                {ellipseAddress(generateAccount().addr, {
                  end: 10,
                  start: 10,
                })}
              </Text>
            </Skeleton>
          </HStack>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={`sign-bytes-modal-fetching-item-${index}`}>
              <Text color={defaultTextColor} fontSize="md" textAlign="center">
                {ellipseAddress(generateAccount().addr, {
                  end: 10,
                  start: 10,
                })}
              </Text>
            </Skeleton>
          ))}
        </VStack>
      );
    }

    return (
      <VStack spacing={4} w="full">
        {/*account select*/}
        <VStack spacing={2} w="full">
          {signBytesRequest.signer ? (
            <>
              <Text textAlign="left" w="full">{`${t<string>(
                'labels.addressToSign'
              )}:`}</Text>
              <AccountItem account={selectedSigner} />
            </>
          ) : (
            <>
              <Text textAlign="left" w="full">{`${t<string>(
                'labels.authorizedAddresses'
              )}:`}</Text>
              <AccountSelect
                accounts={accounts.filter((account) =>
                  signBytesRequest.authorizedAddresses.some(
                    (value) =>
                      value ===
                      AccountService.convertPublicKeyToAlgorandAddress(
                        account.publicKey
                      )
                  )
                )}
                onSelect={handleAccountSelect}
                value={selectedSigner}
              />
            </>
          )}
        </VStack>

        {/* Data display */}
        {decodedJwt ? (
          <SignBytesJwtContent
            decodedJwt={decodedJwt}
            host={signBytesRequest.host}
            signer={selectedSigner}
          />
        ) : (
          <VStack spacing={2} w="full">
            <Text textAlign="left" w="full">{`${t<string>(
              'labels.message'
            )}:`}</Text>
            {signBytesRequest && (
              <Code borderRadius="md" w="full">
                {window.atob(signBytesRequest.encodedData)}
              </Code>
            )}
          </VStack>
        )}
      </VStack>
    );
  };

  useEffect(() => {
    let account: IAccount | null = null;

    if (accounts.length >= 0 && !selectedSigner) {
      if (signBytesRequest?.signer) {
        account =
          accounts.find(
            (value) =>
              AccountService.convertPublicKeyToAlgorandAddress(
                value.publicKey
              ) === signBytesRequest.signer
          ) || null;
      }

      setSelectedSigner(account || accounts[0]);
    }
  }, [accounts, signBytesRequest]);
  useEffect(() => {
    if (signBytesRequest) {
      setDecodedJwt(decodeJwt(window.atob(signBytesRequest.encodedData)));
    }
  }, [signBytesRequest]);
  useEffect(() => {
    if (encodedSignedBytes && signBytesRequest) {
      dispatch(
        sendSignBytesResponse({
          encodedSignature: encodedSignedBytes,
          error: null,
          requestEventId: signBytesRequest.requestEventId,
          tabId: signBytesRequest.tabId,
        })
      );

      handleClose();
    }
  }, [encodedSignedBytes]);
  useEffect(() => {
    if (error) {
      switch (error.code) {
        case ErrorCodeEnum.InvalidPasswordError:
          setPasswordError(t<string>('errors.inputs.invalidPassword'));

          break;
        default:
          dispatch(setError(error));
          handleClose();

          if (signBytesRequest) {
            dispatch(
              sendSignBytesResponse({
                encodedSignature: null,
                error: new SerializableUnknownError(error.message),
                requestEventId: signBytesRequest.requestEventId,
                tabId: signBytesRequest.tabId,
              })
            );
          }

          break;
      }
    }
  }, [error]);

  return (
    <Modal
      isOpen={!!signBytesRequest}
      motionPreset="slideInBottom"
      onClose={handleClose}
      size="full"
      scrollBehavior="inside"
    >
      <ModalContent
        backgroundColor="var(--chakra-colors-chakra-body-bg)"
        borderTopRadius={theme.radii['3xl']}
        borderBottomRadius={0}
      >
        <ModalHeader justifyContent="center" px={DEFAULT_GAP}>
          <VStack alignItems="center" spacing={5} w="full">
            <Avatar
              name={signBytesRequest?.appName || 'unknown'}
              src={signBytesRequest?.iconUrl || undefined}
            />
            <VStack alignItems="center" justifyContent="flex-start" spacing={2}>
              <Heading color={defaultTextColor} size="md" textAlign="center">
                {signBytesRequest?.appName || 'Unknown'}
              </Heading>
              <Box
                backgroundColor={textBackgroundColor}
                borderRadius={theme.radii['3xl']}
                px={2}
                py={1}
              >
                <Text color={defaultTextColor} fontSize="xs" textAlign="center">
                  {signBytesRequest?.host || 'unknown host'}
                </Text>
              </Box>
              {signBytesRequest &&
                (decodedJwt ? (
                  <Text color={subTextColor} fontSize="md" textAlign="center">
                    {t<string>('captions.signJwtRequest')}
                  </Text>
                ) : (
                  <Text color={subTextColor} fontSize="md" textAlign="center">
                    {t<string>('captions.signMessageRequest')}
                  </Text>
                ))}
            </VStack>
          </VStack>
        </ModalHeader>
        <ModalBody px={DEFAULT_GAP}>{renderContent()}</ModalBody>
        <ModalFooter p={DEFAULT_GAP}>
          <VStack alignItems="flex-start" spacing={4} w="full">
            <PasswordInput
              error={passwordError}
              hint={t<string>(
                decodedJwt
                  ? 'captions.mustEnterPasswordToSignSecurityToken'
                  : 'captions.mustEnterPasswordToSign'
              )}
              onChange={handlePasswordChange}
              value={password}
            />
            <HStack spacing={4} w="full">
              <Button
                onClick={handleCancelClick}
                size="lg"
                variant="outline"
                w="full"
              >
                {t<string>('buttons.cancel')}
              </Button>
              <Button
                onClick={handleSignClick}
                size="lg"
                variant="solid"
                w="full"
              >
                {t<string>('buttons.sign')}
              </Button>
            </HStack>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SignBytesModal;
