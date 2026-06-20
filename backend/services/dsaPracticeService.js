import { DsaPractice } from "../models/DsaPractice.js";
import { dateKey, startOfUtcDay } from "./dailyGeneratorService.js";

const dsaQuestions = [
  {
    id: "two-sum-hash-map",
    title: "Two Sum With Hash Map",
    difficulty: "Easy",
    tags: ["Arrays", "Hashing"],
    acceptance: "71%",
    time: "O(n)",
    space: "O(n)",
    prompt:
      "Given an integer array nums and an integer target, return the indices of the two numbers whose sum equals target.",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] equals 9.",
      },
    ],
    constraints: [
      "2 <= nums.length <= 100000",
      "-1000000000 <= nums[i], target <= 1000000000",
      "Exactly one valid answer exists.",
    ],
    hints: [
      "Track each value you have already seen.",
      "For each number, check whether target - number was seen earlier.",
    ],
    approach:
      "Walk through the array once. Store each value with its index in a map. The moment the complement exists, return both indices.",
    solution: `function twoSum(nums, target) {
  const seen = new Map();

  for (let index = 0; index < nums.length; index += 1) {
    const complement = target - nums[index];

    if (seen.has(complement)) {
      return [seen.get(complement), index];
    }

    seen.set(nums[index], index);
  }

  return [];
}`,
  },
  {
    id: "valid-parentheses-stack",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "Strings"],
    acceptance: "64%",
    time: "O(n)",
    space: "O(n)",
    prompt:
      "Given a string containing only brackets, determine whether every opening bracket is closed in the correct order.",
    examples: [
      {
        input: 's = "({[]})"',
        output: "true",
        explanation: "Each closing bracket matches the latest unmatched opener.",
      },
    ],
    constraints: [
      "1 <= s.length <= 10000",
      "s contains only characters (), {}, and [].",
    ],
    hints: [
      "The latest opening bracket must close first.",
      "Use a stack and compare each closing bracket with the top item.",
    ],
    approach:
      "Push opening brackets onto a stack. When a closing bracket appears, pop and verify that it matches. The string is valid only when the stack ends empty.",
    solution: `function isValid(s) {
  const pairs = new Map([
    [")", "("],
    ["}", "{"],
    ["]", "["],
  ]);
  const stack = [];

  for (const char of s) {
    if (!pairs.has(char)) {
      stack.push(char);
      continue;
    }

    if (stack.pop() !== pairs.get(char)) {
      return false;
    }
  }

  return stack.length === 0;
}`,
  },
  {
    id: "longest-substring-sliding-window",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Strings", "Sliding Window"],
    acceptance: "48%",
    time: "O(n)",
    space: "O(k)",
    prompt:
      "Given a string s, return the length of the longest substring that contains no repeated characters.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with length 3.',
      },
    ],
    constraints: [
      "0 <= s.length <= 50000",
      "s may contain letters, digits, symbols, and spaces.",
    ],
    hints: [
      "Keep a window where every character is unique.",
      "When a repeated character appears inside the window, move the left pointer.",
    ],
    approach:
      "Use two pointers and a map of latest character positions. Expand right each step, and move left only past repeats that are still inside the current window.",
    solution: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right += 1) {
    const char = s[right];

    if (lastSeen.has(char) && lastSeen.get(char) >= left) {
      left = lastSeen.get(char) + 1;
    }

    lastSeen.set(char, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}`,
  },
  {
    id: "merge-intervals-sort",
    title: "Merge Intervals",
    difficulty: "Medium",
    tags: ["Arrays", "Sorting"],
    acceptance: "58%",
    time: "O(n log n)",
    space: "O(n)",
    prompt:
      "Given an array of intervals, merge all overlapping intervals and return the non-overlapping result.",
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "[1,3] and [2,6] overlap, so they merge into [1,6].",
      },
    ],
    constraints: [
      "1 <= intervals.length <= 100000",
      "intervals[i].length === 2",
      "0 <= start <= end <= 1000000000",
    ],
    hints: [
      "Sort intervals by start time first.",
      "Compare each interval with the last merged interval.",
    ],
    approach:
      "Sort by start. Keep a result list; if the next interval overlaps the last result, extend the end. Otherwise append it.",
    solution: `function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [];

  for (const interval of intervals) {
    const previous = merged[merged.length - 1];

    if (!previous || interval[0] > previous[1]) {
      merged.push([...interval]);
      continue;
    }

    previous[1] = Math.max(previous[1], interval[1]);
  }

  return merged;
}`,
  },
  {
    id: "binary-tree-level-order",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    tags: ["Tree", "Queue", "BFS"],
    acceptance: "66%",
    time: "O(n)",
    space: "O(n)",
    prompt:
      "Given the root of a binary tree, return its node values level by level from left to right.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
        explanation: "Each nested array contains one tree level.",
      },
    ],
    constraints: [
      "0 <= number of nodes <= 2000",
      "-1000 <= Node.val <= 1000",
    ],
    hints: [
      "Breadth-first search naturally visits nodes by level.",
      "Process exactly the current queue length for each level.",
    ],
    approach:
      "Use a queue initialized with the root. For each level, read the queue size, process that many nodes, and enqueue their children.",
    solution: `function levelOrder(root) {
  if (!root) {
    return [];
  }

  const result = [];
  const queue = [root];

  while (queue.length) {
    const levelSize = queue.length;
    const level = [];

    for (let index = 0; index < levelSize; index += 1) {
      const node = queue.shift();
      level.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}`,
  },
  {
    id: "coin-change-dp",
    title: "Coin Change",
    difficulty: "Medium",
    tags: ["Dynamic Programming"],
    acceptance: "45%",
    time: "O(amount * coins)",
    space: "O(amount)",
    prompt:
      "Given coin denominations and a target amount, return the minimum number of coins needed to make that amount, or -1 if impossible.",
    examples: [
      {
        input: "coins = [1,2,5], amount = 11",
        output: "3",
        explanation: "11 can be formed as 5 + 5 + 1.",
      },
    ],
    constraints: [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2147483647",
      "0 <= amount <= 10000",
    ],
    hints: [
      "Let dp[x] be the fewest coins needed for amount x.",
      "For each amount, try taking every coin that does not exceed it.",
    ],
    approach:
      "Initialize dp[0] as 0 and every other amount as Infinity. Build answers from 1 to amount by trying each coin transition.",
    solution: `function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let value = 1; value <= amount; value += 1) {
    for (const coin of coins) {
      if (coin <= value) {
        dp[value] = Math.min(dp[value], dp[value - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
  },
  {
    id: "kth-largest-min-heap",
    title: "Kth Largest Element in an Array",
    difficulty: "Medium",
    tags: ["Heap", "Arrays"],
    acceptance: "67%",
    time: "O(n log k)",
    space: "O(k)",
    prompt:
      "Given an integer array nums and an integer k, return the kth largest element without fully sorting the array.",
    examples: [
      {
        input: "nums = [3,2,1,5,6,4], k = 2",
        output: "5",
        explanation: "The sorted order is [6,5,4,3,2,1], so the 2nd largest is 5.",
      },
    ],
    constraints: [
      "1 <= k <= nums.length <= 100000",
      "-10000 <= nums[i] <= 10000",
    ],
    hints: [
      "Keep only the k largest values seen so far.",
      "A min-heap of size k leaves the kth largest at the top.",
    ],
    approach:
      "Maintain a min-heap with at most k elements. Push each value, and when size exceeds k, remove the smallest. The heap top is the kth largest.",
    solution: `function findKthLargest(nums, k) {
  const heap = [];
  const swap = (i, j) => ([heap[i], heap[j]] = [heap[j], heap[i]]);
  const bubbleUp = (index) => {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (heap[parent] <= heap[index]) break;
      swap(parent, index);
      index = parent;
    }
  };
  const sinkDown = (index) => {
    while (true) {
      let smallest = index;
      const left = index * 2 + 1;
      const right = index * 2 + 2;

      if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
      if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
      if (smallest === index) break;

      swap(index, smallest);
      index = smallest;
    }
  };
  const push = (value) => {
    heap.push(value);
    bubbleUp(heap.length - 1);
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      sinkDown(0);
    }
    return top;
  };

  for (const value of nums) {
    push(value);
    if (heap.length > k) pop();
  }

  return heap[0];
}`,
  },
  {
    id: "minimum-window-substring",
    title: "Minimum Window Substring",
    difficulty: "Hard",
    tags: ["Strings", "Sliding Window"],
    acceptance: "32%",
    time: "O(n)",
    space: "O(k)",
    prompt:
      "Given strings s and t, return the smallest substring of s that contains every character in t including duplicates.",
    examples: [
      {
        input: 's = "ADOBECODEBANC", t = "ABC"',
        output: '"BANC"',
        explanation: '"BANC" is the shortest window containing A, B, and C.',
      },
    ],
    constraints: [
      "1 <= s.length, t.length <= 100000",
      "s and t contain English letters.",
    ],
    hints: [
      "Track how many required characters are satisfied inside the window.",
      "After the window is valid, shrink from the left to improve the answer.",
    ],
    approach:
      "Count required characters from t. Expand the right pointer while updating window counts. When all requirements are met, shrink left and save the best valid window.",
    solution: `function minWindow(s, t) {
  const need = new Map();
  for (const char of t) {
    need.set(char, (need.get(char) || 0) + 1);
  }

  const window = new Map();
  let formed = 0;
  let left = 0;
  let best = [Infinity, 0, 0];

  for (let right = 0; right < s.length; right += 1) {
    const char = s[right];
    window.set(char, (window.get(char) || 0) + 1);

    if (need.has(char) && window.get(char) === need.get(char)) {
      formed += 1;
    }

    while (formed === need.size) {
      if (right - left + 1 < best[0]) {
        best = [right - left + 1, left, right];
      }

      const leftChar = s[left];
      window.set(leftChar, window.get(leftChar) - 1);

      if (need.has(leftChar) && window.get(leftChar) < need.get(leftChar)) {
        formed -= 1;
      }

      left += 1;
    }
  }

  return best[0] === Infinity ? "" : s.slice(best[1], best[2] + 1);
}`,
  },
];

const hashText = (value) =>
  [...String(value)].reduce((total, char) => total + char.charCodeAt(0), 0);

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const getQuestionById = (questionId) =>
  dsaQuestions.find((question) => question.id === questionId) || dsaQuestions[0];

const getDailyQuestion = (userId = "guest", date = new Date()) => {
  const seed = hashText(`${userId}:${dateKey(date)}:dsa-question`);
  return dsaQuestions[seed % dsaQuestions.length];
};

const serializeQuestion = (question) => ({
  id: question.id,
  title: question.title,
  difficulty: question.difficulty,
  tags: question.tags,
  acceptance: question.acceptance,
  time: question.time,
  space: question.space,
  prompt: question.prompt,
  examples: question.examples,
  constraints: question.constraints,
  hints: question.hints,
  approach: question.approach,
  solution: question.solution,
});

const getCurrentStreakFromDates = (completedDates, date = new Date()) => {
  const today = startOfUtcDay(date);
  const activeDays = new Set(completedDates.map((item) => dateKey(item)));
  let cursor = activeDays.has(dateKey(today)) ? today : addDays(today, -1);
  let streak = 0;

  while (activeDays.has(dateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
};

const getBestStreakFromDates = (completedDates) => {
  let best = 0;
  let current = 0;
  let previousTime = null;

  for (const date of completedDates) {
    const time = startOfUtcDay(date).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    current = previousTime !== null && time - previousTime === oneDay ? current + 1 : 1;
    best = Math.max(best, current);
    previousTime = time;
  }

  return best;
};

const buildWeeklyActivity = (completedDates, date = new Date()) => {
  const today = startOfUtcDay(date);
  const activeDays = new Set(completedDates.map((item) => dateKey(item)));

  return Array.from({ length: 28 }, (_, index) => {
    const day = addDays(today, index - 27);
    const key = dateKey(day);

    return {
      date: key,
      completed: activeDays.has(key),
    };
  });
};

const getDsaStats = async (userId, date = new Date()) => {
  const today = startOfUtcDay(date);
  const completedRows = await DsaPractice.find({
    userId,
    completed: true,
    date: { $lte: today },
  })
    .sort({ date: 1 })
    .select("date")
    .lean();

  const completedDates = completedRows.map((row) => row.date);

  return {
    currentStreak: getCurrentStreakFromDates(completedDates, today),
    bestStreak: getBestStreakFromDates(completedDates),
    totalSolved: completedDates.length,
    weeklyActivity: buildWeeklyActivity(completedDates, today),
  };
};

const serializePractice = async (practice, userId, date = new Date(), saved = true) => {
  const question = getQuestionById(practice.questionId || getDailyQuestion(userId, date).id);
  const stats = saved
    ? await getDsaStats(userId, date)
    : {
        currentStreak: practice.completed ? 1 : 0,
        bestStreak: practice.completed ? 1 : 0,
        totalSolved: practice.completed ? 1 : 0,
        weeklyActivity: buildWeeklyActivity(
          practice.completed ? [startOfUtcDay(date)] : [],
          date,
        ),
      };

  return {
    id: practice._id?.toString?.(),
    date: dateKey(practice.date || date),
    question: serializeQuestion(question),
    completedToday: Boolean(practice.completed),
    completedAt: practice.completedAt || null,
    saved,
    ...stats,
  };
};

export const buildDefaultDsaPracticePayload = (
  userId = "guest",
  date = new Date(),
  { completed = false } = {},
) => {
  const dayStart = startOfUtcDay(date);
  const question = getDailyQuestion(userId, dayStart);

  return {
    date: dateKey(dayStart),
    question: serializeQuestion(question),
    completedToday: completed,
    completedAt: completed ? new Date() : null,
    currentStreak: completed ? 1 : 0,
    bestStreak: completed ? 1 : 0,
    totalSolved: completed ? 1 : 0,
    weeklyActivity: buildWeeklyActivity(completed ? [dayStart] : [], dayStart),
    saved: false,
  };
};

export const getTodayDsaPractice = async (userId, date = new Date()) => {
  const dayStart = startOfUtcDay(date);
  const question = getDailyQuestion(userId, dayStart);

  const practice = await DsaPractice.findOneAndUpdate(
    { userId, date: dayStart },
    {
      $setOnInsert: {
        userId,
        date: dayStart,
        questionId: question.id,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return serializePractice(practice, userId, dayStart);
};

export const completeTodayDsaPractice = async (userId, date = new Date()) => {
  const dayStart = startOfUtcDay(date);
  const question = getDailyQuestion(userId, dayStart);
  const existing = await DsaPractice.findOne({ userId, date: dayStart });

  const practice = await DsaPractice.findOneAndUpdate(
    { userId, date: dayStart },
    {
      $setOnInsert: {
        userId,
        date: dayStart,
        questionId: existing?.questionId || question.id,
      },
      ...(existing?.completed
        ? {}
        : {
            $set: {
              completed: true,
              completedAt: new Date(),
            },
          }),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return serializePractice(practice, userId, dayStart);
};
