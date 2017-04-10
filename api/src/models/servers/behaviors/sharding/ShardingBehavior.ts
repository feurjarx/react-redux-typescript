interface ShardingBehavior {
    repeated: boolean;
    title?: string;
    getSlaveServerId?(...args);
}

export default ShardingBehavior;