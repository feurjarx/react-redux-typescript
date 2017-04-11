interface ShardingBehavior {
    repeated: boolean;
    type?: string;
    getSlaveServerId?(...args);
}

export default ShardingBehavior;