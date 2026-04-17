# 评分实现规范（伪代码）

```ts
type Answer = { questionId: string; rawScore: 1 | 2 | 3 | 4 | 5 };
type Question = {
  id: string;
  dimensionId: string;
  reverseScored: boolean;
};
type Dimension = { id: string; weight: number };
type Role = {
  id: string;
  archetypeVector: Record<string, number>; // D1~D6 => 0~100
};

function normalizeScore(raw: number, reverse: boolean): number {
  const adjusted = reverse ? 6 - raw : raw; // 1~5
  return ((adjusted - 1) / 4) * 100; // 0~100
}

function buildUserVector(
  answers: Answer[],
  questions: Question[],
  dimensions: Dimension[]
): Record<string, number> {
  const byDim: Record<string, number[]> = {};
  for (const d of dimensions) byDim[d.id] = [];

  for (const a of answers) {
    const q = questions.find((x) => x.id === a.questionId);
    if (!q) continue;
    const score = normalizeScore(a.rawScore, q.reverseScored);
    byDim[q.dimensionId].push(score);
  }

  const userVector: Record<string, number> = {};
  for (const d of dimensions) {
    const arr = byDim[d.id];
    const mean = arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 50;
    userVector[d.id] = mean;
  }
  return userVector;
}

function calcDistance(
  userVector: Record<string, number>,
  roleVector: Record<string, number>,
  dimensions: Dimension[]
): number {
  let sum = 0;
  for (const d of dimensions) {
    sum += d.weight * Math.abs(userVector[d.id] - roleVector[d.id]);
  }
  return sum;
}

function rankRoles(
  userVector: Record<string, number>,
  roles: Role[],
  dimensions: Dimension[]
) {
  const maxDistance = dimensions.reduce((s, d) => s + d.weight * 100, 0);

  return roles
    .map((role) => {
      const distance = calcDistance(userVector, role.archetypeVector, dimensions);
      const similarity = Math.max(0, Math.round((1 - distance / maxDistance) * 100));
      return { roleId: role.id, distance, similarity };
    })
    .sort((a, b) => a.distance - b.distance);
}
```

## 置信度判定

- 设第一名相似度 `top1`，第二名 `top2`：
  - `top1 - top2 >= 6`：高置信度结果
  - `top1 - top2 < 6`：边界型结果（展示双角色解读）

## 质量控制（建议）

- 最大单一选项比例超过 `0.8`，添加“结果可能不稳定”提示。
- 总作答时长低于 `45s`，提示“建议更直觉但认真地重测”。
