export type ReleasePolicy = {
  maxDaysSinceRelease: number;
  minCommitsSinceRelease: number;
  requirePassingCi: boolean;
};

export type ShipcueConfig = {
  owners: string[];
  repos?: string[];
  includeForks: boolean;
  includeArchived: boolean;
  excludeRepos: string[];
  releasePolicy: ReleasePolicy;
};

export type RepoSnapshot = {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description?: string;
  defaultBranch: string;
  archived: boolean;
  fork: boolean;
  stars: number;
  language?: string;
  pushedAt?: string;
  latestRelease?: ReleaseSnapshot;
  latestTag?: ReleaseSnapshot;
  commitsSinceRelease: CommitSnapshot[];
  mergedPrsSinceRelease: PullRequestSnapshot[];
  openBlockers: IssueSnapshot[];
  ci: CiSnapshot;
  packageFiles: PackageFileSnapshot[];
};

export type ReleaseSnapshot = {
  name: string;
  tagName: string;
  publishedAt: string;
  url?: string;
};

export type CommitSnapshot = {
  sha: string;
  message: string;
  date: string;
  url?: string;
};

export type PullRequestSnapshot = {
  number: number;
  title: string;
  mergedAt: string;
  url?: string;
  labels?: string[];
};

export type IssueSnapshot = {
  number: number;
  title: string;
  url?: string;
  labels: string[];
};

export type CiSnapshot = {
  hasWorkflow: boolean;
  status: 'passing' | 'failing' | 'unknown' | 'missing';
  url?: string;
};

export type PackageFileSnapshot = {
  path: string;
  version?: string;
  kind: 'npm' | 'python' | 'cargo' | 'go' | 'other';
};

export type ScoredRepo = RepoSnapshot & {
  score: number;
  daysSinceRelease: number | null;
  readinessBand: 'ready' | 'watch' | 'hold' | 'manual-review';
  nextAction: 'release-patch' | 'release-minor' | 'hold-ci' | 'hold-fresh' | 'manual-review' | 'initial-release';
  reasons: string[];
  releaseType: 'patch' | 'minor' | 'hold' | 'manual-review';
};

export type ScanResult = {
  generatedAt: string;
  source: 'fixture' | 'github';
  config: ShipcueConfig;
  repos: ScoredRepo[];
};
