// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title AuditLog - Immutable audit trail for AI-processed business datasets
contract AuditLog {
    struct Record {
        string datasetHash;    // keccak256 hash of uploaded CSV data
        string aiSummaryHash;  // keccak256 hash of AI prediction response
        string action;         // e.g., "DATA_UPLOAD", "AI_QUERY"
        uint256 timestamp;     // block timestamp
        address recorder;      // wallet that submitted the record
    }

    Record[] private records;

    event RecordAdded(
        uint256 indexed id,
        string action,
        string datasetHash,
        string aiSummaryHash,
        uint256 timestamp,
        address indexed recorder
    );

    /// @notice Add a new immutable audit record
    function addRecord(
        string calldata _datasetHash,
        string calldata _aiSummaryHash,
        string calldata _action
    ) external {
        records.push(Record({
            datasetHash: _datasetHash,
            aiSummaryHash: _aiSummaryHash,
            action: _action,
            timestamp: block.timestamp,
            recorder: msg.sender
        }));

        emit RecordAdded(
            records.length - 1,
            _action,
            _datasetHash,
            _aiSummaryHash,
            block.timestamp,
            msg.sender
        );
    }

    /// @notice Get a single record by index
    function getRecord(uint256 index) external view returns (Record memory) {
        require(index < records.length, "Index out of bounds");
        return records[index];
    }

    /// @notice Get all audit records
    function getRecords() external view returns (Record[] memory) {
        return records;
    }

    /// @notice Total number of stored records
    function getRecordCount() external view returns (uint256) {
        return records.length;
    }
}
