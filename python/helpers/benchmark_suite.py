"""
BENCHMARK SUITE
===============
Self-testing benchmarks and quality metrics.

Features:
- Performance benchmarks
- Quality metrics
- Regression testing
- Comparison reports
- Automated testing
"""

from __future__ import annotations

import json
import statistics
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional


@dataclass
class BenchmarkResult:
    """Result of a single benchmark run"""
    name: str
    duration_ms: float
    success: bool
    score: float
    metrics: Dict[str, float] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)
    error: Optional[str] = None


@dataclass
class Benchmark:
    """A benchmark test"""
    name: str
    description: str
    runner: Callable
    validator: Optional[Callable] = None
    category: str = "general"
    iterations: int = 1
    timeout: float = 60.0
    baseline_score: float = 1.0

    results: List[BenchmarkResult] = field(default_factory=list)


@dataclass
class BenchmarkSuite:
    """A collection of related benchmarks"""
    name: str
    description: str
    benchmarks: List[Benchmark] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)


class MetricCollector:
    """Collects and aggregates metrics"""

    def __init__(self):
        self.metrics: Dict[str, List[float]] = {}

    def record(self, name: str, value: float):
        """Record a metric value"""
        if name not in self.metrics:
            self.metrics[name] = []
        self.metrics[name].append(value)

    def get_stats(self, name: str) -> Dict[str, float]:
        """Get statistics for a metric"""
        values = self.metrics.get(name, [])
        if not values:
            return {}

        return {
            "count": len(values),
            "min": min(values),
            "max": max(values),
            "mean": statistics.mean(values),
            "median": statistics.median(values),
            "stdev": statistics.stdev(values) if len(values) > 1 else 0
        }

    def get_all_stats(self) -> Dict[str, Dict[str, float]]:
        """Get statistics for all metrics"""
        return {name: self.get_stats(name) for name in self.metrics}

    def clear(self):
        """Clear all metrics"""
        self.metrics.clear()


class BenchmarkRunner:
    """
    Comprehensive benchmark suite.
    Test, measure, and validate agent performance.
    """

    def __init__(self):
        self.suites: Dict[str, BenchmarkSuite] = {}
        self.results: List[BenchmarkResult] = []
        self.metrics = MetricCollector()
        self.baselines: Dict[str, float] = {}
        self._setup_default_benchmarks()

    def _setup_default_benchmarks(self):
        """Setup default benchmarks"""
        # Performance suite
        perf_suite = BenchmarkSuite(
            name="performance",
            description="Performance benchmarks"
        )

        perf_suite.benchmarks = [
            Benchmark(
                name="list_creation",
                description="Benchmark list creation speed",
                runner=lambda: [i for i in range(10000)],
                category="python",
                iterations=10
            ),
            Benchmark(
                name="dict_operations",
                description="Benchmark dictionary operations",
                runner=lambda: {str(i): i for i in range(1000)},
                category="python",
                iterations=10
            ),
            Benchmark(
                name="string_concat",
                description="Benchmark string concatenation",
                runner=lambda: "".join(str(i) for i in range(1000)),
                category="python",
                iterations=10
            )
        ]

        self.suites["performance"] = perf_suite

        # Quality suite
        quality_suite = BenchmarkSuite(
            name="quality",
            description="Quality benchmarks"
        )

        quality_suite.benchmarks = [
            Benchmark(
                name="memory_efficiency",
                description="Check memory efficiency",
                runner=self._benchmark_memory,
                category="system",
                iterations=3
            ),
            Benchmark(
                name="response_consistency",
                description="Check response consistency",
                runner=self._benchmark_consistency,
                category="reasoning",
                iterations=5
            )
        ]

        self.suites["quality"] = quality_suite

    def _benchmark_memory(self) -> Dict[str, Any]:
        """Memory efficiency benchmark"""
        import sys
        test_data = [{"key": i, "value": str(i) * 100} for i in range(100)]
        size = sys.getsizeof(test_data)
        return {"size_bytes": size, "items": len(test_data)}

    def _benchmark_consistency(self) -> Dict[str, Any]:
        """Response consistency benchmark"""
        results = []
        for _ in range(3):
            start = time.time()
            _ = sum(i * i for i in range(1000))
            results.append(time.time() - start)

        variance = statistics.variance(results) if len(results) > 1 else 0
        return {"variance": variance, "samples": len(results)}

    def create_suite(self, name: str, description: str = "") -> BenchmarkSuite:
        """Create a new benchmark suite"""
        suite = BenchmarkSuite(name=name, description=description)
        self.suites[name] = suite
        return suite

    def add_benchmark(self, suite_name: str, benchmark: Benchmark):
        """Add a benchmark to a suite"""
        if suite_name not in self.suites:
            self.create_suite(suite_name)
        self.suites[suite_name].benchmarks.append(benchmark)

    def run_benchmark(self, benchmark: Benchmark) -> BenchmarkResult:
        """Run a single benchmark"""
        durations = []
        success = True
        error = None
        result_data = None

        try:
            for _ in range(benchmark.iterations):
                start = time.time()
                result_data = benchmark.runner()
                duration = (time.time() - start) * 1000
                durations.append(duration)

            # Validate if validator provided
            if benchmark.validator and result_data is not None:
                success = benchmark.validator(result_data)

        except Exception as e:
            success = False
            error = str(e)

        avg_duration = statistics.mean(durations) if durations else 0

        # Calculate score (higher is better, based on speed and success)
        if success:
            score = benchmark.baseline_score / max(avg_duration / 1000, 0.001)
        else:
            score = 0.0

        result = BenchmarkResult(
            name=benchmark.name,
            duration_ms=avg_duration,
            success=success,
            score=min(score, 10.0),  # Cap at 10
            metrics={
                "iterations": benchmark.iterations,
                "min_ms": min(durations) if durations else 0,
                "max_ms": max(durations) if durations else 0
            },
            error=error
        )

        benchmark.results.append(result)
        self.results.append(result)
        self.metrics.record(f"{benchmark.name}_duration", avg_duration)

        return result

    def run_suite(self, suite_name: str) -> List[BenchmarkResult]:
        """Run all benchmarks in a suite"""
        if suite_name not in self.suites:
            return []

        suite = self.suites[suite_name]
        results = []

        for benchmark in suite.benchmarks:
            result = self.run_benchmark(benchmark)
            results.append(result)

        return results

    def run_all(self) -> Dict[str, List[BenchmarkResult]]:
        """Run all benchmark suites"""
        all_results = {}

        for suite_name in self.suites:
            all_results[suite_name] = self.run_suite(suite_name)

        return all_results

    def set_baseline(self, benchmark_name: str, score: float):
        """Set baseline score for comparison"""
        self.baselines[benchmark_name] = score

    def compare_to_baseline(self, benchmark_name: str) -> Optional[Dict[str, float]]:
        """Compare current results to baseline"""
        if benchmark_name not in self.baselines:
            return None

        baseline = self.baselines[benchmark_name]

        # Get recent results for this benchmark
        recent = [r for r in self.results if r.name == benchmark_name][-5:]
        if not recent:
            return None

        avg_score = statistics.mean(r.score for r in recent)

        return {
            "baseline": baseline,
            "current": avg_score,
            "difference": avg_score - baseline,
            "percentage_change": ((avg_score - baseline) / baseline) * 100 if baseline else 0
        }

    def get_regression_report(self) -> Dict[str, Any]:
        """Get regression report comparing to baselines"""
        regressions = []
        improvements = []

        for name, baseline in self.baselines.items():
            comparison = self.compare_to_baseline(name)
            if comparison:
                if comparison["percentage_change"] < -10:
                    regressions.append({
                        "name": name,
                        **comparison
                    })
                elif comparison["percentage_change"] > 10:
                    improvements.append({
                        "name": name,
                        **comparison
                    })

        return {
            "regressions": regressions,
            "improvements": improvements,
            "total_benchmarks": len(self.baselines),
            "regressions_count": len(regressions),
            "improvements_count": len(improvements)
        }

    def generate_report(self, format: str = "text") -> str:
        """Generate benchmark report"""
        if format == "json":
            return self._generate_json_report()
        return self._generate_text_report()

    def _generate_text_report(self) -> str:
        """Generate text report"""
        lines = ["=" * 50, "BENCHMARK REPORT", "=" * 50, ""]

        for suite_name, suite in self.suites.items():
            lines.append(f"\n## {suite.name.upper()}")
            lines.append(suite.description)
            lines.append("-" * 30)

            for bench in suite.benchmarks:
                if bench.results:
                    latest = bench.results[-1]
                    status = "✓" if latest.success else "✗"
                    lines.append(
                        f"{status} {bench.name}: {latest.duration_ms:.2f}ms "
                        f"(score: {latest.score:.2f})"
                    )

        # Summary
        lines.append("\n" + "=" * 50)
        lines.append("SUMMARY")
        lines.append("-" * 30)

        total = len(self.results)
        passed = sum(1 for r in self.results if r.success)
        avg_score = statistics.mean(r.score for r in self.results) if self.results else 0

        lines.append(f"Total benchmarks: {total}")
        lines.append(f"Passed: {passed}/{total}")
        lines.append(f"Average score: {avg_score:.2f}")

        return "\n".join(lines)

    def _generate_json_report(self) -> str:
        """Generate JSON report"""
        report = {
            "suites": {},
            "summary": {
                "total": len(self.results),
                "passed": sum(1 for r in self.results if r.success),
                "avg_score": statistics.mean(r.score for r in self.results) if self.results else 0
            },
            "metrics": self.metrics.get_all_stats()
        }

        for suite_name, suite in self.suites.items():
            report["suites"][suite_name] = {
                "description": suite.description,
                "benchmarks": [
                    {
                        "name": b.name,
                        "results": [
                            {
                                "duration_ms": r.duration_ms,
                                "success": r.success,
                                "score": r.score
                            }
                            for r in b.results[-5:]
                        ]
                    }
                    for b in suite.benchmarks
                ]
            }

        return json.dumps(report, indent=2)

    def get_statistics(self) -> Dict[str, Any]:
        """Get benchmark statistics"""
        return {
            "total_suites": len(self.suites),
            "total_benchmarks": sum(len(s.benchmarks) for s in self.suites.values()),
            "total_runs": len(self.results),
            "success_rate": sum(1 for r in self.results if r.success) / max(len(self.results), 1),
            "avg_duration_ms": statistics.mean(r.duration_ms for r in self.results) if self.results else 0,
            "metrics": self.metrics.get_all_stats()
        }


# Singleton
_benchmark_runner: Optional[BenchmarkRunner] = None


def get_benchmark_runner() -> BenchmarkRunner:
    """Get the Benchmark Runner singleton"""
    global _benchmark_runner
    if _benchmark_runner is None:
        _benchmark_runner = BenchmarkRunner()
    return _benchmark_runner
