// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Fundsmith {
    error InvalidAmount();
    error TransferFailed(address recipient);

    /// @notice Batch fund multiple addresses with the same amount of native tokens
    /// @param recipients Array of addresses to receive funds
    /// @param amountPerRecipient The amount each recipient should receive
    function batchFund(address[] calldata recipients, uint256 amountPerRecipient) external payable {
        if (msg.value != recipients.length * amountPerRecipient) {
            revert InvalidAmount();
        }

        for (uint256 i = 0; i < recipients.length; i++) {
            (bool success, ) = recipients[i].call{value: amountPerRecipient}("");
            if (!success) {
                revert TransferFailed(recipients[i]);
            }
        }
    }
}
