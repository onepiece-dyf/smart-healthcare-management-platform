import { ref, computed } from 'vue';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
}

interface CacheOptions {
  ttl?: number; // 默认5分钟
  maxSize?: number; // 最大缓存项数
}

class DataCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5分钟
  private maxSize = 100; // 最大100个缓存项

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 获取缓存统计信息
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 创建全局缓存实例
const globalCache = new DataCache({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100
});

export function useDataCache<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions) {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const data = ref<T | null>(null);

  const cache = options ? new DataCache(options) : globalCache;

  const loadData = async (forceRefresh = false) => {
    // 如果不强制刷新且缓存存在，直接返回缓存数据
    if (!forceRefresh && cache.has(key)) {
      data.value = cache.get<T>(key);
      return data.value;
    }

    loading.value = true;
    error.value = null;

    try {
      const result = await fetcher();
      data.value = result;
      cache.set(key, result);
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '数据加载失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const refresh = () => loadData(true);
  const clear = () => cache.delete(key);

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    loadData,
    refresh,
    clear
  };
}

export { globalCache };
