from python.helpers import benchmark_suite as bs
from python.helpers.tool import Response, Tool


class Benchmark(Tool):
    """Tool for running performance benchmarks and quality tests."""

    async def execute(self, **kwargs):
        operation = self.args.get("operation", "status")

        runner = bs.get_benchmark_runner()

        if operation == "run":
            suite_name = self.args.get("suite", "")

            if suite_name:
                results = runner.run_suite(suite_name)

                if results:
                    result_lines = "\n".join([
                        f"  {'✓' if r.success else '✗'} {r.name}: {r.duration_ms:.2f}ms (score: {r.score:.2f})"
                        for r in results
                    ])
                    return Response(
                        message=f"🏃 Ran suite '{suite_name}':\n{result_lines}",
                        break_loop=False
                    )
                return Response(
                    message=f"❌ Suite not found: {suite_name}",
                    break_loop=False
                )
            else:
                all_results = runner.run_all()

                total = sum(len(r) for r in all_results.values())
                passed = sum(
                    sum(1 for r in results if r.success)
                    for results in all_results.values()
                )

                return Response(
                    message=f"🏃 Ran all benchmarks:\n" +
                            f"  Suites: {len(all_results)}\n" +
                            f"  Total: {total}\n" +
                            f"  Passed: {passed}/{total}",
                    break_loop=False
                )

        elif operation == "suites":
            suites = list(runner.suites.keys())

            suite_info = "\n".join([
                f"  - {name}: {len(runner.suites[name].benchmarks)} benchmarks"
                for name in suites
            ])

            return Response(
                message=f"📋 **Available Suites**\n{suite_info}",
                break_loop=False
            )

        elif operation == "create_suite":
            name = self.args.get("name", "")
            description = self.args.get("description", "")

            if not name:
                return Response(
                    message="❌ Suite name required.",
                    break_loop=False
                )

            suite = runner.create_suite(name, description)

            return Response(
                message=f"✅ Created suite: {name}\n" +
                        f"  Description: {description}",
                break_loop=False
            )

        elif operation == "baseline":
            benchmark_name = self.args.get("benchmark", "")
            score = self.args.get("score", 0.0)

            if not benchmark_name:
                return Response(
                    message="❌ Benchmark name required.",
                    break_loop=False
                )

            runner.set_baseline(benchmark_name, score)

            return Response(
                message=f"📏 Set baseline for '{benchmark_name}': {score}",
                break_loop=False
            )

        elif operation == "compare":
            benchmark_name = self.args.get("benchmark", "")

            if not benchmark_name:
                return Response(
                    message="❌ Benchmark name required.",
                    break_loop=False
                )

            comparison = runner.compare_to_baseline(benchmark_name)

            if comparison:
                return Response(
                    message=f"📊 **Comparison: {benchmark_name}**\n" +
                            f"  Baseline: {comparison['baseline']:.2f}\n" +
                            f"  Current: {comparison['current']:.2f}\n" +
                            f"  Change: {comparison['percentage_change']:+.1f}%",
                    break_loop=False
                )
            return Response(
                message=f"No baseline set for: {benchmark_name}",
                break_loop=False
            )

        elif operation == "regression":
            report = runner.get_regression_report()

            msg = f"📉 **Regression Report**\n"

            if report['regressions']:
                msg += "Regressions:\n"
                for r in report['regressions']:
                    msg += f"  ⚠️ {r['name']}: {r['percentage_change']:+.1f}%\n"
            else:
                msg += "✅ No regressions detected.\n"

            if report['improvements']:
                msg += "Improvements:\n"
                for i in report['improvements']:
                    msg += f"  ✨ {i['name']}: {i['percentage_change']:+.1f}%\n"

            return Response(message=msg, break_loop=False)

        elif operation == "report":
            format_type = self.args.get("format", "text")

            report = runner.generate_report(format_type)

            return Response(
                message=f"📊 **Benchmark Report**\n{report[:1500]}",
                break_loop=False
            )

        else:  # status
            stats = runner.get_statistics()

            return Response(
                message=f"📊 **Benchmark Runner Status**\n" +
                        f"Total suites: {stats['total_suites']}\n" +
                        f"Total benchmarks: {stats['total_benchmarks']}\n" +
                        f"Total runs: {stats['total_runs']}\n" +
                        f"Success rate: {stats['success_rate']:.0%}\n" +
                        f"Avg duration: {stats['avg_duration_ms']:.2f}ms",
                break_loop=False
            )
