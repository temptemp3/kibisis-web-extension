import {
  Code,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AssetDisplay from '@extension/components/AssetDisplay';
import CopyIconButton from '@extension/components/CopyIconButton';
import MoreInformationAccordion from '@extension/components/MoreInformationAccordion';
import OpenTabIconButton from '@extension/components/OpenTabIconButton';
import PageItem, { ITEM_HEIGHT } from '@extension/components/PageItem';

// constants
import { DEFAULT_GAP } from '@extension/constants';

// hooks
import useDefaultTextColor from '@extension/hooks/useDefaultTextColor';
import usePrimaryColorScheme from '@extension/hooks/usePrimaryColorScheme';
import useSubTextColor from '@extension/hooks/useSubTextColor';

// selectors
import { useSelectPreferredBlockExplorer } from '@extension/selectors';

// types
import {
  IAccount,
  IApplicationTransaction,
  IExplorer,
  INetwork,
} from '@extension/types';

// utils
import { createIconFromDataUri, ellipseAddress } from '@extension/utils';
import InnerTransactionAccordion from '@extension/components/InnerTransactionAccordion';

interface IProps {
  account: IAccount;
  network: INetwork;
  transaction: IApplicationTransaction;
}

const ApplicationTransactionContent: FC<IProps> = ({
  account,
  network,
  transaction,
}: IProps) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  // selectors
  const preferredExplorer: IExplorer | null = useSelectPreferredBlockExplorer();
  // hooks
  const defaultTextColor: string = useDefaultTextColor();
  const primaryColorScheme: string = usePrimaryColorScheme();
  const subTextColor: string = useSubTextColor();
  // state
  const [openInnerTransactionAccordions, setOpenInnerTransactionAccordions] =
    useState<boolean[]>(
      Array.from(
        { length: transaction.innerTransactions?.length || 0 },
        () => false
      )
    );
  // misc
  const explorer: IExplorer | null =
    network.explorers.find((value) => value.id === preferredExplorer?.id) ||
    network.explorers[0] ||
    null; // get the preferred explorer, if it exists in the networks, otherwise get the default one
  // handlers
  const handleInnerTransactionsAccordionToggle =
    (accordionIndex: number) => (open: boolean) => {
      setOpenInnerTransactionAccordions(
        openInnerTransactionAccordions.map((value, index) =>
          index === accordionIndex ? open : value
        )
      );
    };
  const handleMoreInformationToggle = (value: boolean) =>
    value ? onOpen() : onClose();

  return (
    <>
      <VStack
        alignItems="flex-start"
        justifyContent="flex-start"
        px={DEFAULT_GAP}
        spacing={4}
        w="full"
      >
        {/*app id*/}
        {transaction.applicationId && (
          <PageItem fontSize="sm" label={t<string>('labels.applicationId')}>
            <HStack spacing={0}>
              <Text color={subTextColor} fontSize="sm">
                {transaction.applicationId}
              </Text>
              <CopyIconButton
                ariaLabel="Copy application ID"
                copiedTooltipLabel={t<string>('captions.applicationIdCopied')}
                size="sm"
                value={transaction.applicationId}
              />
              {explorer && (
                <OpenTabIconButton
                  size="sm"
                  tooltipLabel={t<string>('captions.openOn', {
                    name: explorer.canonicalName,
                  })}
                  url={`${explorer.baseUrl}${explorer.applicationPath}/${transaction.applicationId}`}
                />
              )}
            </HStack>
          </PageItem>
        )}

        {/*fee*/}
        <PageItem fontSize="sm" label={t<string>('labels.fee')}>
          <AssetDisplay
            atomicUnitAmount={new BigNumber(transaction.fee)}
            amountColor="red.500"
            decimals={network.nativeCurrency.decimals}
            fontSize="sm"
            icon={createIconFromDataUri(network.nativeCurrency.iconUri, {
              color: subTextColor,
              h: 3,
              w: 3,
            })}
            prefix="-"
            unit={network.nativeCurrency.code}
          />
        </PageItem>

        {/*completed date*/}
        {transaction.completedAt && (
          <PageItem fontSize="sm" label={t<string>('labels.date')}>
            <Text color={subTextColor} fontSize="sm">
              {new Date(transaction.completedAt).toLocaleString()}
            </Text>
          </PageItem>
        )}

        {/*note*/}
        {transaction.note && (
          <PageItem fontSize="sm" label={t<string>('labels.note')}>
            <Code
              borderRadius="md"
              color={defaultTextColor}
              fontSize="sm"
              wordBreak="break-word"
            >
              {transaction.note}
            </Code>
          </PageItem>
        )}

        <MoreInformationAccordion
          color={defaultTextColor}
          fontSize="sm"
          isOpen={isOpen}
          minButtonHeight={ITEM_HEIGHT}
          onChange={handleMoreInformationToggle}
        >
          <VStack spacing={4} w="full">
            {/*id*/}
            <PageItem fontSize="sm" label={t<string>('labels.id')}>
              {transaction.id ? (
                <HStack spacing={0}>
                  <Tooltip
                    aria-label="The ID of the transaction"
                    label={transaction.id}
                  >
                    <Text color={subTextColor} fontSize="sm">
                      {ellipseAddress(transaction.id, {
                        end: 10,
                        start: 10,
                      })}
                    </Text>
                  </Tooltip>
                  <CopyIconButton
                    ariaLabel="Copy transaction ID"
                    copiedTooltipLabel={t<string>(
                      'captions.transactionIdCopied'
                    )}
                    size="sm"
                    value={transaction.id}
                  />
                  {explorer && (
                    <OpenTabIconButton
                      size="sm"
                      tooltipLabel={t<string>('captions.openOn', {
                        name: explorer.canonicalName,
                      })}
                      url={`${explorer.baseUrl}${explorer.transactionPath}/${transaction.id}`}
                    />
                  )}
                </HStack>
              ) : (
                <Text color={subTextColor} fontSize="sm">
                  {'-'}
                </Text>
              )}
            </PageItem>

            {/*group id*/}
            {transaction.groupId && (
              <PageItem fontSize="sm" label={t<string>('labels.groupId')}>
                <HStack spacing={0}>
                  <Tooltip
                    aria-label="The group ID of the transaction"
                    label={transaction.groupId}
                  >
                    <Text color={subTextColor} fontSize="sm">
                      {ellipseAddress(transaction.groupId, {
                        end: 10,
                        start: 10,
                      })}
                    </Text>
                  </Tooltip>
                  <CopyIconButton
                    ariaLabel="Copy group ID"
                    copiedTooltipLabel={t<string>('captions.groupIdCopied')}
                    size="sm"
                    value={transaction.groupId}
                  />
                  {explorer && explorer.groupPath && (
                    <OpenTabIconButton
                      size="sm"
                      tooltipLabel={t<string>('captions.openOn', {
                        name: explorer.canonicalName,
                      })}
                      url={`${explorer.baseUrl}${
                        explorer.groupPath
                      }/${encodeURIComponent(transaction.groupId)}`}
                    />
                  )}
                </HStack>
              </PageItem>
            )}
          </VStack>
        </MoreInformationAccordion>
      </VStack>

      {/*inner transactions*/}
      {transaction.innerTransactions && (
        <Tabs
          colorScheme={primaryColorScheme}
          m={0}
          sx={{ display: 'flex', flexDirection: 'column' }}
          w="full"
        >
          <TabList>
            <Tab>{t<string>('labels.innerTransactions')}</Tab>
          </TabList>
          <TabPanels
            flexGrow={1}
            sx={{ display: 'flex', flexDirection: 'column' }}
          >
            <TabPanel
              m={0}
              p={0}
              sx={{ display: 'flex', flexDirection: 'column' }}
              w="full"
            >
              <VStack pb={DEFAULT_GAP} pt={0} px={0} spacing={0} w="full">
                {transaction.innerTransactions.map((value, index) => (
                  <InnerTransactionAccordion
                    account={account}
                    color={defaultTextColor}
                    fontSize="sm"
                    isOpen={openInnerTransactionAccordions[index]}
                    key={`transaction-page-application-inner-transaction-item-${index}`}
                    minButtonHeight={ITEM_HEIGHT}
                    network={network}
                    onChange={handleInnerTransactionsAccordionToggle(index)}
                    transaction={value}
                  />
                ))}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </>
  );
};

export default ApplicationTransactionContent;
