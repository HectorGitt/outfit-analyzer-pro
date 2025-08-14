import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
	rank: number;
	username: string;
	display_name: string;
	analysis_count: number;
	last_activity: string;
	badge: {
		name: string;
		color: string;
		icon: string;
	};
}

interface FashionIcon {
	username: string;
	display_name: string;
	total_scored_analyses: number;
	avg_overall_score: number;
	last_updated: string;
	icon: {
		name: string;
		color: string;
		icon: string;
	};
	title: string;
}

interface LeaderboardProps {
	users: LeaderboardUser[];
	title: string;
	className?: string;
}

interface FashionIconCardProps {
	icon: FashionIcon;
	className?: string;
}

const getRankIcon = (rank: number) => {
	switch (rank) {
		case 1:
			return <Trophy className="w-5 h-5 text-yellow-500" />;
		case 2:
			return <Medal className="w-5 h-5 text-gray-400" />;
		case 3:
			return <Award className="w-5 h-5 text-amber-600" />;
		default:
			return <Star className="w-5 h-5 text-muted-foreground" />;
	}
};

const getBadgeColor = (color: string) => {
	switch (color.toLowerCase()) {
		case "gold":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		case "silver":
			return "bg-gray-100 text-gray-800 border-gray-200";
		case "bronze":
			return "bg-amber-100 text-amber-800 border-amber-200";
		case "green":
			return "bg-green-100 text-green-800 border-green-200";
		case "blue":
			return "bg-blue-100 text-blue-800 border-blue-200";
		default:
			return "bg-muted text-muted-foreground";
	}
};

export function Leaderboard({ users, title, className }: LeaderboardProps) {
	return (
		<Card className={cn("card-fashion", className)}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Trophy className="w-5 h-5 text-primary" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{users.map((user) => (
					<div
						key={user.rank}
						className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
					>
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-8 h-8">
								{getRankIcon(user.rank)}
							</div>
							<div>
								<p className="font-semibold">{user.display_name}</p>
								<p className="text-sm text-muted-foreground">
									@{user.username}
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="font-bold text-lg">{user.analysis_count}</p>
							<Badge className={getBadgeColor(user.badge.color)}>
								{user.badge.icon} {user.badge.name}
							</Badge>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}

export function FashionIconCard({ icon, className }: FashionIconCardProps) {
	return (
		<Card className={cn("card-fashion bg-gradient-to-br from-primary/5 to-accent/5", className)}>
			<CardHeader className="text-center">
				<div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-2xl mb-2">
					{icon.icon.icon}
				</div>
				<CardTitle className="text-gradient">{icon.title}</CardTitle>
			</CardHeader>
			<CardContent className="text-center space-y-4">
				<div>
					<h3 className="font-bold text-xl">{icon.display_name}</h3>
					<p className="text-muted-foreground">@{icon.username}</p>
				</div>
				
				<div className="grid grid-cols-2 gap-4">
					<div className="text-center">
						<p className="text-2xl font-bold text-primary">
							{icon.avg_overall_score.toFixed(1)}
						</p>
						<p className="text-sm text-muted-foreground">Avg Score</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-primary">
							{icon.total_scored_analyses}
						</p>
						<p className="text-sm text-muted-foreground">Analyses</p>
					</div>
				</div>
				
				<Badge className={getBadgeColor(icon.icon.color)}>
					{icon.icon.icon} {icon.icon.name}
				</Badge>
			</CardContent>
		</Card>
	);
}