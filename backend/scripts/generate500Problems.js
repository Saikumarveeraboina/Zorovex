import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseProblems = {
  "Arrays": [
    { title: "Two Sum", diff: "Easy", link: "two-sum" },
    { title: "Best Time to Buy and Sell Stock", diff: "Easy", link: "best-time-to-buy-and-sell-stock" },
    { title: "Contains Duplicate", diff: "Easy", link: "contains-duplicate" },
    { title: "Product of Array Except Self", diff: "Medium", link: "product-of-array-except-self" },
    { title: "Maximum Subarray", diff: "Medium", link: "maximum-subarray" },
    { title: "Maximum Product Subarray", diff: "Medium", link: "maximum-product-subarray" },
    { title: "Find Minimum in Rotated Sorted Array", diff: "Medium", link: "find-minimum-in-rotated-sorted-array" },
    { title: "Search in Rotated Sorted Array", diff: "Medium", link: "search-in-rotated-sorted-array" },
    { title: "3Sum", diff: "Medium", link: "3sum" },
    { title: "Container With Most Water", diff: "Medium", link: "container-with-most-water" },
    { title: "Trapping Rain Water", diff: "Hard", link: "trapping-rain-water" },
    { title: "Merge Intervals", diff: "Medium", link: "merge-intervals" },
    { title: "Subarray Sum Equals K", diff: "Medium", link: "subarray-sum-equals-k" },
    { title: "Spiral Matrix", diff: "Medium", link: "spiral-matrix" },
    { title: "Jump Game", diff: "Medium", link: "jump-game" },
    { title: "Merge Sorted Array", diff: "Easy", link: "merge-sorted-array" },
    { title: "Move Zeroes", diff: "Easy", link: "move-zeroes" },
    { title: "Sort Colors", diff: "Medium", link: "sort-colors" },
    { title: "Find Peak Element", diff: "Medium", link: "find-peak-element" },
    { title: "Insert Interval", diff: "Medium", link: "insert-interval" },
    { title: "First Missing Positive", diff: "Hard", link: "first-missing-positive" },
    { title: "Longest Consecutive Sequence", diff: "Medium", link: "longest-consecutive-sequence" }
  ],
  "Strings": [
    { title: "Valid Anagram", diff: "Easy", link: "valid-anagram" },
    { title: "Valid Palindrome", diff: "Easy", link: "valid-palindrome" },
    { title: "Longest Substring Without Repeating Characters", diff: "Medium", link: "longest-substring-without-repeating-characters" },
    { title: "Longest Repeating Character Replacement", diff: "Medium", link: "longest-repeating-character-replacement" },
    { title: "Minimum Window Substring", diff: "Hard", link: "minimum-window-substring" },
    { title: "Valid Parentheses", diff: "Easy", link: "valid-parentheses" },
    { title: "Group Anagrams", diff: "Medium", link: "group-anagrams" },
    { title: "Longest Palindromic Substring", diff: "Medium", link: "longest-palindromic-substring" },
    { title: "Palindromic Substrings", diff: "Medium", link: "palindromic-substrings" },
    { title: "Encode and Decode Strings", diff: "Medium", link: "encode-and-decode-strings" },
    { title: "Word Break", diff: "Medium", link: "word-break" },
    { title: "Find All Anagrams in a String", diff: "Medium", link: "find-all-anagrams-in-a-string" },
    { title: "Decode Ways", diff: "Medium", link: "decode-ways" },
    { title: "Wildcard Matching", diff: "Hard", link: "wildcard-matching" },
    { title: "Regular Expression Matching", diff: "Hard", link: "regular-expression-matching" },
    { title: "Implement strStr()", diff: "Easy", link: "implement-strstr" },
    { title: "Longest Common Prefix", diff: "Easy", link: "longest-common-prefix" },
    { title: "StringToInteger (atoi)", diff: "Medium", link: "string-to-integer-atoi" },
    { title: "Generate Parentheses", diff: "Medium", link: "generate-parentheses" },
    { title: "Count and Say", diff: "Medium", link: "count-and-say" },
    { title: "String Compression", diff: "Medium", link: "string-compression" },
    { title: "Longest Valid Parentheses", diff: "Hard", link: "longest-valid-parentheses" },
    { title: "Distinct Subsequences", diff: "Hard", link: "distinct-subsequences" }
  ],
  "LinkedList": [
    { title: "Reverse Linked List", diff: "Easy", link: "reverse-linked-list" },
    { title: "Linked List Cycle", diff: "Easy", link: "linked-list-cycle" },
    { title: "Merge Two Sorted Lists", diff: "Easy", link: "merge-two-sorted-lists" },
    { title: "Merge K Sorted Lists", diff: "Hard", link: "merge-k-sorted-lists" },
    { title: "Remove Nth Node From End of List", diff: "Medium", link: "remove-nth-node-from-end-of-list" },
    { title: "Reorder List", diff: "Medium", link: "reorder-list" },
    { title: "Middle of the Linked List", diff: "Easy", link: "middle-of-the-linked-list" },
    { title: "Palindrome Linked List", diff: "Easy", link: "palindrome-linked-list" },
    { title: "Intersection of Two Linked Lists", diff: "Easy", link: "intersection-of-two-linked-lists" },
    { title: "Copy List with Random Pointer", diff: "Medium", link: "copy-list-with-random-pointer" },
    { title: "Add Two Numbers", diff: "Medium", link: "add-two-numbers" },
    { title: "Reverse Nodes in k-Group", diff: "Hard", link: "reverse-nodes-in-k-group" },
    { title: "Flatten a Multilevel Doubly Linked List", diff: "Medium", link: "flatten-a-multilevel-doubly-linked-list" },
    { title: "Partition List", diff: "Medium", link: "partition-list" },
    { title: "LRU Cache", diff: "Medium", link: "lru-cache" },
    { title: "Swap Nodes in Pairs", diff: "Medium", link: "swap-nodes-in-pairs" },
    { title: "Remove Duplicates from Sorted List", diff: "Easy", link: "remove-duplicates-from-sorted-list" },
    { title: "Remove Linked List Elements", diff: "Easy", link: "remove-linked-list-elements" }
  ],
  "Trees": [
    { title: "Maximum Depth of Binary Tree", diff: "Easy", link: "maximum-depth-of-binary-tree" },
    { title: "Same Tree", diff: "Easy", link: "same-tree" },
    { title: "Invert Binary Tree", diff: "Easy", link: "invert-binary-tree" },
    { title: "Binary Tree Maximum Path Sum", diff: "Hard", link: "binary-tree-maximum-path-sum" },
    { title: "Binary Tree Level Order Traversal", diff: "Medium", link: "binary-tree-level-order-traversal" },
    { title: "Serialize and Deserialize Binary Tree", diff: "Hard", link: "serialize-and-deserialize-binary-tree" },
    { title: "Subtree of Another Tree", diff: "Easy", link: "subtree-of-another-tree" },
    { title: "Construct Binary Tree from Preorder and Inorder Traversal", diff: "Medium", link: "construct-binary-tree-from-preorder-and-inorder-traversal" },
    { title: "Validate Binary Search Tree", diff: "Medium", link: "validate-binary-search-tree" },
    { title: "Kth Smallest Element in a BST", diff: "Medium", link: "kth-smallest-element-in-a-bst" },
    { title: "Lowest Common Ancestor of a BST", diff: "Medium", link: "lowest-common-ancestor-of-a-binary-search-tree" },
    { title: "Implement Trie (Prefix Tree)", diff: "Medium", link: "implement-trie-prefix-tree" },
    { title: "Design Add and Search Words Data Structure", diff: "Medium", link: "design-add-and-search-words-data-structure" },
    { title: "Word Search II", diff: "Hard", link: "word-search-ii" },
    { title: "Symmetric Tree", diff: "Easy", link: "symmetric-tree" },
    { title: "Path Sum", diff: "Easy", link: "path-sum" },
    { title: "Count Complete Tree Nodes", diff: "Medium", link: "count-complete-tree-nodes" },
    { title: "Binary Tree Zigzag Level Order Traversal", diff: "Medium", link: "binary-tree-zigzag-level-order-traversal" },
    { title: "Binary Search Tree Iterator", diff: "Medium", link: "binary-search-tree-iterator" },
    { title: "Flatten Binary Tree to Linked List", diff: "Medium", link: "flatten-binary-tree-to-linked-list" }
  ],
  "Graphs": [
    { title: "Number of Islands", diff: "Medium", link: "number-of-islands" },
    { title: "Clone Graph", diff: "Medium", link: "clone-graph" },
    { title: "Max Area of Island", diff: "Medium", link: "max-area-of-island" },
    { title: "Pacific Atlantic Water Flow", diff: "Medium", link: "pacific-atlantic-water-flow" },
    { title: "Surrounded Regions", diff: "Medium", link: "surrounded-regions" },
    { title: "Rotting Oranges", diff: "Medium", link: "rotting-oranges" },
    { title: "Walls and Gates", diff: "Medium", link: "walls-and-gates" },
    { title: "Course Schedule", diff: "Medium", link: "course-schedule" },
    { title: "Course Schedule II", diff: "Medium", link: "course-schedule-ii" },
    { title: "Redundant Connection", diff: "Medium", link: "redundant-connection" },
    { title: "Number of Connected Components", diff: "Medium", link: "number-of-connected-components-in-an-undirected-graph" },
    { title: "Graph Valid Tree", diff: "Medium", link: "graph-valid-tree" },
    { title: "Word Ladder", diff: "Hard", link: "word-ladder" },
    { title: "Alien Dictionary", diff: "Hard", link: "alien-dictionary" },
    { title: "Cheapest Flights Within K Stops", diff: "Medium", link: "cheapest-flights-within-k-stops" },
    { title: "Network Delay Time", diff: "Medium", link: "network-delay-time" },
    { title: "Accounts Merge", diff: "Medium", link: "accounts-merge" },
    { title: "Longest Increasing Path in a Matrix", diff: "Hard", link: "longest-increasing-path-in-a-matrix" },
    { title: "Find Eventual Safe States", diff: "Medium", link: "find-eventual-safe-states" },
    { title: "Is Graph Bipartite?", diff: "Medium", link: "is-graph-bipartite" }
  ],
  "Dynamic Programming": [
    { title: "Climbing Stairs", diff: "Easy", link: "climbing-stairs" },
    { title: "Min Cost Climbing Stairs", diff: "Easy", link: "min-cost-climbing-stairs" },
    { title: "Coin Change", diff: "Medium", link: "coin-change" },
    { title: "Coin Change II", diff: "Medium", link: "coin-change-ii" },
    { title: "Longest Increasing Subsequence", diff: "Medium", link: "longest-increasing-subsequence" },
    { title: "Longest Common Subsequence", diff: "Medium", link: "longest-common-subsequence" },
    { title: "Word Break Problem", diff: "Medium", link: "word-break" },
    { title: "Combination Sum", diff: "Medium", link: "combination-sum" },
    { title: "House Robber", diff: "Medium", link: "house-robber" },
    { title: "House Robber II", diff: "Medium", link: "house-robber-ii" },
    { title: "House Robber III", diff: "Medium", link: "house-robber-iii" },
    { title: "Decode Ways", diff: "Medium", link: "decode-ways" },
    { title: "Unique Paths", diff: "Medium", link: "unique-paths" },
    { title: "Unique Paths II", diff: "Medium", link: "unique-paths-ii" },
    { title: "Jump Game", diff: "Medium", link: "jump-game" },
    { title: "Jump Game II", diff: "Medium", link: "jump-game-ii" },
    { title: "Partition Equal Subset Sum", diff: "Medium", link: "partition-equal-subset-sum" },
    { title: "Target Sum", diff: "Medium", link: "target-sum" },
    { title: "Edit Distance", diff: "Hard", link: "edit-distance" }
  ]
};

const companies = ["TCS", "Amazon", "Google", "Microsoft", "Flipkart"];
const generatedData = {};

let totalCount = 0;

companies.forEach((company) => {
  generatedData[company] = {};
  
  Object.keys(baseProblems).forEach((topic) => {
    let topicArray = [];
    
    // Copy base problems verbatim
    baseProblems[topic].forEach((prob, idx) => {
      topicArray.push({
        id: `${company.toLowerCase().substring(0,3)}-${topic.substring(0,3).toLowerCase()}-${idx+1}`,
        title: prob.title,
        difficulty: prob.diff,
        link: `https://leetcode.com/problems/${prob.link}/`
      });
      totalCount++;
    });

    generatedData[company][topic] = topicArray;
  });
});

console.log(`Generated ${totalCount} total problems.`);

const outputPath = path.join(__dirname, '../src/data/dsaProblems.json');
fs.writeFileSync(outputPath, JSON.stringify(generatedData, null, 2));
